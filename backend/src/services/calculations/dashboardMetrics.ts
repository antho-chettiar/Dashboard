import { prisma } from '../../utils/database';

export const dashboardMetricsService = {
  /**
   * Dashboard Overview Metrics
   */
  getOverviewMetrics: async () => {
    // Total Artists
    const totalArtistsPromise = prisma.artist.count();

    // Total Concerts
    const totalConcertsPromise = prisma.concert.count();

    // Tickets Sold Aggregate
    const ticketsSoldPromise = prisma.concert.aggregate({
      _sum: {
        ticketsSold: true,
      },
    });

    // Revenue Aggregate
    const revenuePromise = prisma.concert.aggregate({
      _sum: {
        totalRevenue: true,
      },
    });

    // Execute all queries together
    const [
      totalArtists,
      totalConcerts,
      ticketsSoldResult,
      revenueResult,
    ] = await Promise.all([
      totalArtistsPromise,
      totalConcertsPromise,
      ticketsSoldPromise,
      revenuePromise,
    ]);

    return {
      totalArtists,

      totalConcerts,

      ticketsSold:
        ticketsSoldResult._sum.ticketsSold || 0,

      revenue:
        revenueResult._sum.totalRevenue
          ? Number(revenueResult._sum.totalRevenue)
          : 0,
    };
  },

  /**
   * Revenue Per City
   */
  getRevenuePerCity: async () => {
    const cityRevenue = await prisma.concert.groupBy({
      by: ['city'],

      _sum: {
        totalRevenue: true,
      },

      orderBy: {
        _sum: {
          totalRevenue: 'desc',
        },
      },
    });

    return cityRevenue.map((item) => ({
      city: item.city || 'Unknown',

      revenue: item._sum.totalRevenue
        ? Number(item._sum.totalRevenue)
        : 0,
    }));
  },

  /**
   * Genre Popularity
   */
  getGenrePopularity: async () => {
    const genreData = await prisma.artist.groupBy({
      by: ['genre'],

      _count: {
        id: true,
      },

      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    return genreData.map((item) => ({
      genre: item.genre || 'Unknown',

      artistCount: item._count.id,
    }));
  },

    /**
     * Audience Gender Distribution
     */
    getGenderDistribution: async () => {
      const demographics = await prisma.audienceDemographic.findMany({
        where: {
          dimension: 'GENDER',
        },
        select: {
          dimensionValue: true,
          percentage: true,
        },
      });

      const grouped: Record<string, number[]> = {};

      demographics.forEach((item) => {
        const key = item.dimensionValue || 'Unknown';

        if (!grouped[key]) {
          grouped[key] = [];
        }

        grouped[key].push(Number(item.percentage || 0));
      });

      const result = Object.entries(grouped).map(([gender, values]) => ({
        gender,
        percentage:
          values.reduce((a, b) => a + b, 0) / values.length,
      }));

      return result;
    },

      /**
     * Audience Age Distribution
     */
    getAgeDistribution: async () => {
      const demographics = await prisma.audienceDemographic.findMany({
        where: {
          dimension: 'AGE_GROUP',
        },
        select: {
          dimensionValue: true,
          percentage: true,
        },
      });
  
      const grouped: Record<string, number[]> = {};
  
      demographics.forEach((item) => {
        const key = item.dimensionValue || 'Unknown';
    
        if (!grouped[key]) {
          grouped[key] = [];
        }
    
        grouped[key].push(Number(item.percentage || 0));
      });
  
      const result = Object.entries(grouped).map(([ageGroup, values]) => ({
        ageGroup,
        percentage:
          values.reduce((a, b) => a + b, 0) / values.length,
      }));
  
      return result;
    },

/**
   * Top Artists
   * Ranked by:
   * - Revenue
   * - Tickets Sold
   */
  getTopArtists: async (
    months: number = 12,
    limit: number = 10
  ) => {
    const fromDate = new Date();

    fromDate.setMonth(fromDate.getMonth() - months);

    const concerts = await prisma.concert.findMany({
      where: {
        concertDate: {
          gte: fromDate,
        },
      },

      include: {
        artist: {
          select: {
            id: true,
            artistName: true,
            genre: true,
          },
        },
      },
    });

    const artistMap: Record<
      string,
      {
        artistId: string;
        artistName: string;
        genre: string;
        revenue: number;
        ticketsSold: number;
        concerts: number;
      }
    > = {};

    concerts.forEach((concert: any) => {
      if (!concert.artist) return;

      const artistId = concert.artist.id;

      if (!artistMap[artistId]) {
        artistMap[artistId] = {
          artistId,
          artistName: concert.artist.artistName,
          genre: concert.artist.genre || 'Unknown',
          revenue: 0,
          ticketsSold: 0,
          concerts: 0,
        };
      }

      artistMap[artistId].revenue += Number(
        concert.totalRevenue || 0
      );

      artistMap[artistId].ticketsSold +=
        concert.ticketsSold || 0;

      artistMap[artistId].concerts += 1;
    });

    const rankedArtists = Object.values(artistMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);

    return rankedArtists;
  },
};

export default dashboardMetricsService;