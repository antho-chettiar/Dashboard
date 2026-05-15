import { Response } from 'express';
import { prisma, redis } from '../utils/database';
import dashboardMetricsService from '../services/calculations/dashboardMetrics';

const CACHE_TTL = 60 * 60; // 1 hour

export const dashboardController = {
  // Get all KPIs for dashboard homepage
  getKPIs: async (req: any, res: Response) => {
    try {
      const cacheKey = 'dashboard:kpis';
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.status(200).json({
          success: true,
          data: { kpis: JSON.parse(cached) },
          cached: true,
        });
      }

      const now = new Date();
      const currentYear = now.getFullYear();
      const startOfYear = new Date(currentYear, 0, 1);

      // Total active artists
      const totalArtists = await prisma.artist.count({
        where: { active: true },
      });

      // Total concerts (all time)
      const totalConcerts = await prisma.concert.count();

      // Tickets sold YTD
      const ticketsSoldYTD = await prisma.concert.aggregate({
        where: {
          concertDate: { gte: startOfYear },
        },
        _sum: {
          ticketsSold: true,
        },
      });

      // Total revenue YTD
      const revenueYTD = await prisma.concert.aggregate({
        where: {
          concertDate: { gte: startOfYear },
        },
        _sum: {
          totalRevenue: true,
        },
      });

      // Avg RoG across all platforms (last 30 days)
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const avgRoG = await prisma.platformMetric.aggregate({
        where: {
          metricDate: { gte: thirtyDaysAgo },
          rogDaily: { not: null },
        },
        _avg: {
          rogDaily: true,
        },
      });

      // Top artist by streams (last month)
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // First, find the artistId with max streams
      const topArtistAgg = await prisma.platformMetric.groupBy({
        by: ['artistId'],
        where: {
          metricDate: { gte: oneMonthAgo },
          platform: 'YOUTUBE',
        },
        _max: {
          streams: true,
        },
        orderBy: {
          _max: {
            streams: 'desc',
          },
        },
        take: 1,
      });

      let topArtistByStreams = null;
      if (topArtistAgg.length > 0) {
        const { artistId, _max } = topArtistAgg[0];
        // Fetch artist details separately
        const artist = await prisma.artist.findUnique({
          where: { id: artistId },
          select: {
            id: true,
            name: true,
            photoUrl: true,
          },
        });
        if (artist) {
          topArtistByStreams = {
            id: artist.id,
            name: artist.name,
            photoUrl: artist.photoUrl,
            streams: _max.streams || 0,
          };
        }
      }

      const kpis = {
        totalArtists,
        totalConcerts,
        ticketsSoldYTD: ticketsSoldYTD._sum.ticketsSold || 0,
        revenueYTD: revenueYTD._sum.totalRevenue || 0,
        avgRoGDaily: avgRoG._avg.rogDaily ? parseFloat(avgRoG._avg.rogDaily.toFixed(2)) : 0,
        topArtistByStreams,
      };

      // Cache for 1 hour
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(kpis));

      const safeData = JSON.parse(
  JSON.stringify({ kpis }, (_, value) =>
    typeof value === 'bigint' ? Number(value) : value
  )
);

res.status(200).json({
  success: true,
  data: safeData,
});


    } catch (error) {
      throw error;
    }
  },

  // Top performing artists by followers
  getTopArtists: async (req: any, res: Response) => {
    try {
      const { limit = 10, platform } = req.query;

      const cacheKey = `dashboard:topArtists:${limit}:${platform || 'all'}`;
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.status(200).json({
          success: true,
          data: { artists: JSON.parse(cached) },
          cached: true,
        });
      }

      // Get latest metrics per artist+platform by fetching recent metrics sorted by date
      // We'll fetch metrics from the last 90 days and deduplicate in memory
      const now = new Date();
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      const allMetrics = await prisma.platformMetric.findMany({
        where: {
          metricDate: { gte: ninetyDaysAgo },
          ...(platform && { platform: platform.toUpperCase() }),
        },
        orderBy: { metricDate: 'desc' },
        select: {
          artistId: true,
          platform: true,
          followers: true,
        },
      });

      // Deduplicate: keep only the latest metric for each artist+platform combination
      const latestMap = new Map<string, typeof allMetrics[0]>();
      for (const metric of allMetrics) {
        const key = `${metric.artistId}:${metric.platform}`;
        if (!latestMap.has(key)) {
          latestMap.set(key, metric);
        }
      }
      const latestMetrics = Array.from(latestMap.values());

      if (latestMetrics.length === 0) {
        return res.status(200).json({
          success: true,
          data: { artists: [] },
        });
      }

      // Group by artist to sum total followers across platforms
      const artistFollowers: any = {};

      for (const metric of latestMetrics) {
        if (!artistFollowers[metric.artistId]) {
          artistFollowers[metric.artistId] = {
            artistId: metric.artistId,
            totalFollowers: 0,
            platforms: [],
          };
        }

        artistFollowers[metric.artistId].totalFollowers += Number(metric.followers || 0);

        artistFollowers[metric.artistId].platforms.push({
          platform: metric.platform,
          followers: Number(metric.followers || 0),
        });
      }

      // Sort by total followers
      const sortedArtists = Object.values(artistFollowers)
        .sort((a: any, b: any) => b.totalFollowers - a.totalFollowers)
        .slice(0, parseInt(limit as string));

      // Enrich with artist details
      const artistIds = sortedArtists.map((a: any) => a.artistId);
      const artists = await prisma.artist.findMany({
        where: { id: { in: artistIds } },
        include: {
          genres: {
            include: {
              genre: true,
            },
          },
        },
      });

      const artistMap = artists.reduce((acc, artist) => {
        acc[artist.id] = artist;
        return acc;
      }, {} as any);

      const enriched = sortedArtists.map((item: any) => ({
        ...item,
        artist: artistMap[item.artistId] || null,
      }));

      console.log("TopArtists → sorted:", sortedArtists.length);
      console.log("TopArtists → enriched:", enriched.length);

      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(enriched));

      res.status(200).json({
        success: true,
        data: JSON.parse(JSON.stringify({ artists: enriched })),
      });

    } catch (error) {
       console.error("TopArtists ERROR:", error);

      return res.status(500).json({
      success: false,
       message: "Top Artists Failed",
      error: String(error),
    });
   }
  },

    // Revenue Per City
  getRevenuePerCity: async (req: any, res: Response) => {
    try {
      const data =
        await dashboardMetricsService.getRevenuePerCity();

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      console.error('Revenue Per City Error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to fetch revenue per city',
        error: error.message,
      });
    }
  },

  // Genre Popularity
  getGenrePopularity: async (req: any, res: Response) => {
    try {
      const data =
        await dashboardMetricsService.getGenrePopularity();

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      console.error('Genre Popularity Error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to fetch genre popularity',
        error: error.message,
      });
    }
  },

  // Gender Distribution
  getGenderDistribution: async (req: any, res: Response) => {
    try {
      const data =
        await dashboardMetricsService.getGenderDistribution();

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      console.error('Gender Distribution Error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to fetch gender distribution',
        error: error.message,
      });
    }
  },

  // Age Distribution
  getAgeDistribution: async (req: any, res: Response) => {
    try {
      const data =
        await dashboardMetricsService.getAgeDistribution();

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      console.error('Age Distribution Error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to fetch age distribution',
        error: error.message,
      });
    }
  },

};

export default dashboardController;