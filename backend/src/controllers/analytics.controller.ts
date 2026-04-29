import { Response } from 'express';
import { prisma, redis } from '../utils/database';
import { Decimal } from '@prisma/client/runtime/library';

const CACHE_TTL = 60 * 60; // 1 hour

export const analyticsController = {
  // Rate of Growth (RoG) for artist(s)
  getRoG: async (req: any, res: Response) => {
    try {
      const { artistId, platform, period = 'daily' } = req.query;

      const cacheKey = `rog:${artistId || 'all'}:${platform || 'all'}:${period}`;

      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.status(200).json({
          success: true,
          data: JSON.parse(cached),
          cached: true,
        });
      }

      const where: any = {};
      if (artistId) where.artistId = artistId;
      if (platform) where.platform = platform.toUpperCase();

      const metrics = await prisma.platformMetric.findMany({
        where,
        orderBy: { metricDate: 'desc' },
        take: 1000,
        include: {
          artist: {
            select: { id: true, name: true },
          },
        },
      });

      const results = metrics.map((metric) => {
        const rogField = period === 'daily' ? metric.rogDaily
          : period === 'weekly' ? metric.rogWeekly
          : metric.rogMonthly;

        return {
          id: metric.id,
          artistId: metric.artistId,
          artistName: metric.artist.name,
          platform: metric.platform,
          metricDate: metric.metricDate,
          followers: metric.followers,
          rog: rogField,
        };
      }).filter((r) => r.rog !== null);

      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(results));

      res.status(200).json({
        success: true,
        data: { results },
      });
    } catch (error) {
      throw error;
    }
  },

  // M4: Time-series trends — now cached in Redis (was uncached, called 3× per dashboard load)
  getTrends: async (req: any, res: Response) => {
    try {
      const { metric = 'followers', platform, dateFrom, dateTo, artistId } = req.query;

      // Build a cache key that captures all query params so different filters don't collide
      const cacheKey = `trends:${metric}:${platform || 'all'}:${artistId || 'all'}:${dateFrom || ''}:${dateTo || ''}`;

      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.status(200).json({
          success: true,
          data: { trends: JSON.parse(cached) },
          cached: true,
        });
      }

      const where: any = {};
      if (artistId) where.artistId = artistId;
      if (platform) where.platform = platform.toUpperCase();
      if (dateFrom || dateTo) {
        where.metricDate = {};
        if (dateFrom) where.metricDate.gte = new Date(dateFrom as string);
        if (dateTo) where.metricDate.lte = new Date(dateTo as string);
      }

      const metrics = await prisma.platformMetric.findMany({
        where,
        orderBy: { metricDate: 'asc' },
        take: 1000,
      });

      const trends = metrics.map((m) => {
        const point: any = { date: m.metricDate };
        point[metric as string] = (m as any)[metric as string] || 0;
        point.followers = m.followers;
        point.likes = m.likes;
        point.streams = m.streams;
        point.artistId = m.artistId;
        return point;
      });

      // Trends change less frequently than real-time — cache for 30 minutes
      // (shorter than 1hr because date-range queries may be more specific)
      await redis.setex(cacheKey, 30 * 60, JSON.stringify(trends));

      const safeData = JSON.parse(
  JSON.stringify({ trends }, (_, value) =>
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

  // Demographics: Age group breakdown
  getDemographicsAge: async (req: any, res: Response) => {
    try {
      const { artistId, concertId } = req.query;

      const cacheKey = `demo:age:${artistId || 'all'}:${concertId || 'all'}`;
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.status(200).json({
          success: true,
          data: JSON.parse(cached),
          cached: true,
        });
      }

      const where: any = { dimension: 'AGE_GROUP' };
      if (artistId) where.artistId = artistId;
      if (concertId) where.concertId = concertId;

      const data = await prisma.audienceDemographic.groupBy({
        by: ['dimensionValue'],
        where,
        _sum: { absoluteCount: true },
        _avg: { percentage: true },
        orderBy: { _sum: { absoluteCount: 'desc' } },
      });

      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(data));

const safeData = JSON.parse(
  JSON.stringify({ breakdown: data }, (_, value) =>
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

  // Demographics: Gender distribution
  getDemographicsGender: async (req: any, res: Response) => {
    try {
      const { artistId, concertId } = req.query;

      const cacheKey = `demo:gender:${artistId || 'all'}:${concertId || 'all'}`;
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.status(200).json({
          success: true,
          data: JSON.parse(cached),
          cached: true,
        });
      }

      const where: any = { dimension: 'GENDER' };
      if (artistId) where.artistId = artistId;
      if (concertId) where.concertId = concertId;

      const data = await prisma.audienceDemographic.groupBy({
        by: ['dimensionValue'],
        where,
        _sum: { absoluteCount: true },
        _avg: { percentage: true },
        orderBy: { _sum: { absoluteCount: 'desc' } },
      });

      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(data));

     const safeData = JSON.parse(
  JSON.stringify({ breakdown: data }, (_, value) =>
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

  // Demographics: Geographic distribution (for map)
  getDemographicsGeo: async (req: any, res: Response) => {
    try {
      const { artistId, concertId } = req.query;

      const where: any = { dimension: 'GEOGRAPHY' };
      if (artistId) where.artistId = artistId;
      if (concertId) where.concertId = concertId;

      const data = await prisma.audienceDemographic.groupBy({
        by: ['dimensionValue'],
        where,
        _sum: { absoluteCount: true },
        orderBy: { _sum: { absoluteCount: 'desc' } },
        take: 100,
      });

      const features = data.map((item, index) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [0, 0],
        },
        properties: {
          name: item.dimensionValue,
          count: item._sum.absoluteCount || 0,
          rank: index + 1,
        },
      }));

      res.status(200).json({
        success: true,
        data: {
          type: 'FeatureCollection',
          features,
        },
      });
    } catch (error) {
      throw error;
    }
  },

  // Genre popularity — single query, Redis cached (N+1 fix already applied)
  getGenres: async (req: any, res: Response) => {
    try {
      const { artistId } = req.query;

      const cacheKey = `genres:${artistId || 'all'}`;
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.status(200).json({
          success: true,
          data: { genres: JSON.parse(cached) },
          cached: true,
        });
      }

      const genres = await prisma.genre.findMany({
        include: {
          artists: {
            include: {
              artist: {
                include: {
                  platformMetrics: {
                    orderBy: { metricDate: 'desc' },
                    take: 1,
                    select: { followers: true },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          artists: { _count: 'desc' },
        },
      });

      const enrichedGenres = genres.map((genre) => {
        const artistCount = genre.artists.length;
        const totalFollowers = genre.artists.reduce((sum, ag) => {
          const latestFollowers = ag.artist.platformMetrics[0]?.followers || 0;
          return sum + Number(latestFollowers);
        }, 0);

        return {
          genreId: genre.id,
          genreName: genre.name,
          artistCount,
          totalFollowers,
        };
      });

      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(enrichedGenres));

      res.status(200).json({
        success: true,
        data: { genres: enrichedGenres },
      });
    } catch (error) {
      throw error;
    }
  },
};

export default analyticsController;