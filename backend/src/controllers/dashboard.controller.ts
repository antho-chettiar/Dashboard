import { Response } from 'express';
import { prisma, redis } from '../utils/database';

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
          data: JSON.parse(cached),
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
      const topArtistStreams = await prisma.platformMetric.groupBy({
        by: ['artistId'],
        where: {
          metricDate: { gte: oneMonthAgo },
          platform: 'YOUTUBE', // or could be SPOTIFY
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
        include: {
          artist: {
            select: {
              id: true,
              name: true,
              photoUrl: true,
            },
          },
        },
      });

      const topArtist = topArtistStreams[0];

      const kpis = {
        totalArtists,
        totalConcerts,
        ticketsSoldYTD: ticketsSoldYTD._sum.ticketsSold || 0,
        revenueYTD: revenueYTD._sum.totalRevenue || 0,
        avgRoGDaily: avgRoG._avg.rogDaily ? parseFloat(avgRoG._avg.rogDaily.toFixed(2)) : 0,
        topArtistByStreams: topArtist ? {
          id: topArtist.artist.id,
          name: topArtist.artist.name,
          photoUrl: topArtist.artist.photoUrl,
          streams: topArtist._max.streams,
        } : null,
      };

      // Cache for 1 hour
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(kpis));

      res.status(200).json({
        success: true,
        data: { kpis },
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
          data: JSON.parse(cached),
          cached: true,
        });
      }

      // Get latest metrics for each artist
      const latestDate = await prisma.platformMetric.groupBy({
        by: ['artistId', 'platform'],
        orderBy: { metricDate: 'desc' },
        take: 1,
      });

      if (latestDate.length === 0) {
        return res.status(200).json({
          success: true,
          data: { artists: [] },
        });
      }

      // Group by artist to get max followers across platforms
      const artistFollowers: any = {};

      for (const metric of latestDate) {
        // Apply platform filter if specified
        if (platform && metric.platform !== platform.toUpperCase()) {
          continue;
        }

        if (!artistFollowers[metric.artistId]) {
          artistFollowers[metric.artistId] = {
            artistId: metric.artistId,
            totalFollowers: 0,
            platforms: [],
          };
        }

        artistFollowers[metric.artistId].totalFollowers += metric.followers || 0;
        artistFollowers[metric.artistId].platforms.push({
          platform: metric.platform,
          followers: metric.followers || 0,
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
        artist: artistMap[item.artistId],
      }));

      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(enriched));

      res.status(200).json({
        success: true,
        data: { artists: enriched },
      });
    } catch (error) {
      throw error;
    }
  },
};

export default dashboardController;
