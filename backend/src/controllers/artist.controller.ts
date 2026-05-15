import { Response } from 'express';
import { prisma } from '../utils/database';
import { CreateArtistInput, UpdateArtistInput } from '../validations/zodSchemas';
import { artistMetrics } from '../services/calculations/artistMetrics';

export const artistController = {
  // List artists with pagination, search, genre filter
  list: async (req: any, res: Response) => {
  try {
    const {
      page = 1,
      limit = 50,
      search,
      genre,
      active = true,
    } = req.query;

    const skip =
      (parseInt(page as string) - 1) *
      parseInt(limit as string);

    // Build where clause
    const where: any = {
      ...(active !== undefined && { active }),
    };

    if (search) {
      where.OR = [
        {
          artistName: {
            contains: search as string,
            mode: 'insensitive',
          },
        },
        {
          nationality: {
            contains: search as string,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (genre) {
      const genreRecord = await prisma.genre.findFirst({
        where: {
          name: {
            equals: genre as string,
            mode: 'insensitive',
          },
        },
      });

      if (genreRecord) {
        where.genres = {
          some: {
            genreId: genreRecord.id,
          },
        };
      }
    }

    const [artists, total] = await Promise.all([
      prisma.artist.findMany({
        where,

        include: {
          genres: {
            include: {
              genre: true,
            },
          },

          concerts: true,

          platformMetrics: {
            orderBy: {
              metricDate: 'desc',
            },

            take: 20,
          },
        },

        skip,

        take: parseInt(limit as string),

        orderBy: {
          artistName: 'asc',
        },
      }),

      prisma.artist.count({ where }),
    ]);

    const transformedArtists = artists.map((artist: any) => {
      const totalFollowers =
        artistMetrics.calculateTotalFollowers({
          instagram: Number(
            artist.instagramFollowers || 0
          ),

          youtube: Number(
            artist.youtubeSubscribers || 0
          ),

          spotify: Number(
            artist.spotifyMonthlyListeners || 0
          ),

          facebook: Number(
            artist.facebookFollowers || 0
          ),

          appleMusic: Number(
            artist.appleMusicListeners || 0
          ),

          twitter: Number(
            artist.twitterFollowers || 0
          ),
        });

      const topPlatform =
        artistMetrics.getTopPlatform({
          instagram: Number(
            artist.instagramFollowers || 0
          ),

          youtube: Number(
            artist.youtubeSubscribers || 0
          ),

          spotify: Number(
            artist.spotifyMonthlyListeners || 0
          ),

          facebook: Number(
            artist.facebookFollowers || 0
          ),

          appleMusic: Number(
            artist.appleMusicListeners || 0
          ),

          twitter: Number(
            artist.twitterFollowers || 0
          ),
        });

      const totalRevenue = artist.concerts.reduce(
        (sum: number, concert: any) =>
          sum +
          Number(concert.totalRevenue || 0),

        0
      );

      const ticketsSold = artist.concerts.reduce(
        (sum: number, concert: any) =>
          sum +
          Number(concert.ticketsSold || 0),

        0
      );

      const avgROG =
        artist.platformMetrics.length > 0
          ? artistMetrics.calculateAverageROG(
              artist.platformMetrics.map(
                (m: any) =>
                  Number(m.rogMonthly || 0)
              )
            )
          : 0;

      const popularityScore =
        artistMetrics.calculatePopularityScore(
          totalFollowers,
          avgROG
        );

      return {
        ...artist,

        totalFollowers,

        totalRevenue,

        ticketsSold,

        avgROG,

        popularityScore,

        topPlatform,
      };
    });

    res.status(200).json({
      success: true,

      data: {
        artists: transformedArtists,

        pagination: {
          page: parseInt(page as string),

          limit: parseInt(limit as string),

          total,

          pages: Math.ceil(
            total / parseInt(limit as string)
          ),
        },
      },
    });
  } catch (error) {
    throw error;
  }
},

  // Get single artist by ID
  // Get single artist by ID
getById: async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const artist = await prisma.artist.findUnique({
      where: { id },

      include: {
        genres: {
          include: {
            genre: true,
          },
        },

        platformMetrics: {
          orderBy: {
            metricDate: 'desc',
          },

          take: 100,
        },

        concerts: {
          orderBy: {
            concertDate: 'desc',
          },
        },

        audienceDemographics: {
          orderBy: {
            metricDate: 'desc',
          },
        },
      },
    });

    if (!artist) {
      return res.status(404).json({
        success: false,
        message: 'Artist not found',
        code: 'ARTIST_NOT_FOUND',
      });
    }

    // =========================
    // FOLLOWERS
    // =========================

    const totalFollowers =
      artistMetrics.calculateTotalFollowers({
        instagram: Number(
          artist.instagramFollowers || 0
        ),

        youtube: Number(
          artist.youtubeSubscribers || 0
        ),

        spotify: Number(
          artist.spotifyMonthlyListeners || 0
        ),

        facebook: Number(
          artist.facebookFollowers || 0
        ),

        appleMusic: Number(
          artist.appleMusicListeners || 0
        ),

        twitter: Number(
          artist.twitterFollowers || 0
        ),
      });

    // =========================
    // TOP PLATFORM
    // =========================

    const topPlatform =
      artistMetrics.getTopPlatform({
        instagram: Number(
          artist.instagramFollowers || 0
        ),

        youtube: Number(
          artist.youtubeSubscribers || 0
        ),

        spotify: Number(
          artist.spotifyMonthlyListeners || 0
        ),

        facebook: Number(
          artist.facebookFollowers || 0
        ),

        appleMusic: Number(
          artist.appleMusicListeners || 0
        ),

        twitter: Number(
          artist.twitterFollowers || 0
        ),
      });

    // =========================
    // REVENUE + TICKETS
    // =========================

    const totalRevenue = artist.concerts.reduce(
      (sum: number, concert: any) =>
        sum + Number(concert.totalRevenue || 0),

      0
    );

    const totalTicketsSold =
      artist.concerts.reduce(
        (sum: number, concert: any) =>
          sum + Number(concert.ticketsSold || 0),

        0
      );

    // =========================
    // AVG ROG
    // =========================

    const avgROG =
      artist.platformMetrics.length > 0
        ? artistMetrics.calculateAverageROG(
            artist.platformMetrics.map(
              (metric: any) =>
                Number(metric.rogMonthly || 0)
            )
          )
        : 0;

    // =========================
    // POPULARITY SCORE
    // =========================

    const popularityScore =
      artistMetrics.calculatePopularityScore(
        totalFollowers,
        avgROG
      );

    // =========================
    // PLATFORM BREAKDOWN
    // =========================

    const platformBreakdown = {
      instagram: Number(
        artist.instagramFollowers || 0
      ),

      youtube: Number(
        artist.youtubeSubscribers || 0
      ),

      spotify: Number(
        artist.spotifyMonthlyListeners || 0
      ),

      facebook: Number(
        artist.facebookFollowers || 0
      ),

      appleMusic: Number(
        artist.appleMusicListeners || 0
      ),

      twitter: Number(
        artist.twitterFollowers || 0
      ),
    };

    // =========================
    // GROWTH TREND
    // =========================

    const growthTrend = artist.platformMetrics.map(
      (metric: any) => ({
        platform: metric.platform,

        metricDate: metric.metricDate,

        followers: Number(metric.followers || 0),

        rogDaily: Number(metric.rogDaily || 0),

        rogWeekly: Number(metric.rogWeekly || 0),

        rogMonthly: Number(metric.rogMonthly || 0),
      })
    );

    // =========================
    // DEMOGRAPHICS
    // =========================

    const demographics =
      artist.audienceDemographics.map(
        (demo: any) => ({
          dimension: demo.dimension,

          value: demo.dimensionValue,

          percentage: Number(
            demo.percentage || 0
          ),

          absoluteCount:
            demo.absoluteCount || 0,
        })
      );

    const transformedArtist = {
      ...artist,

      totalFollowers,

      totalRevenue,

      totalTicketsSold,

      avgROG,

      popularityScore,

      topPlatform,

      platformBreakdown,

      growthTrend,

      demographics,

      concertsOnRecord:
        artist.concerts.length,
    };

    res.status(200).json({
      success: true,

      data: {
        artist: transformedArtist,
      },
    });
  } catch (error) {
    throw error;
  }
},

  // Create artist (admin only)
  create: async (req: any, res: Response) => {
    try {
      const input: CreateArtistInput = req.body;

      const { genreIds, ...artistData } = input;

      // Normalize genreIds: find or create genres
      let genreConnections: any[] = [];
      if (genreIds && genreIds.length > 0) {
        for (const genreId of genreIds) {
          // Check if it's a valid genre ID
          const genre = await prisma.genre.findFirst({
            where: { id: parseInt(genreId) },
          });
          if (genre) {
            genreConnections.push({ genreId: genre.id });
          }
        }
      }

      const artist = await prisma.artist.create({
        data: {
          ...artistData,
          photoUrl: artistData.photoUrl || null,
          genres: { create: genreConnections },
        },
        include: {
          genres: {
            include: {
              genre: true,
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        data: { artist },
        message: 'Artist created successfully',
      });
    } catch (error) {
      throw error;
    }
  },

  // Update artist (admin only)
  update: async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const input: UpdateArtistInput = req.body;

      // Check if artist exists
      const existing = await prisma.artist.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Artist not found',
          code: 'ARTIST_NOT_FOUND',
        });
      }

      const { genreIds, ...artistData } = input;

      // Handle genres
      if (genreIds) {
        // Remove existing genre connections
        await prisma.artistGenre.deleteMany({
          where: { artistId: id },
        });

        // Add new genre connections
        const genreConnections: any[] = [];
        for (const genreId of genreIds) {
          const genre = await prisma.genre.findFirst({
            where: { id: parseInt(genreId) },
          });
          if (genre) {
            genreConnections.push({ genreId: genre.id });
          }
        }

        await prisma.artist.update({
          where: { id },
          data: {
            ...artistData,
            genres: { create: genreConnections },
          },
          include: {
            genres: {
              include: {
                genre: true,
              },
            },
          },
        });
      } else {
        await prisma.artist.update({
          where: { id },
          data: artistData,
          include: {
            genres: {
              include: {
                genre: true,
              },
            },
          },
        });
      }

      const updatedArtist = await prisma.artist.findUnique({
        where: { id },
        include: {
          genres: {
            include: {
              genre: true,
            },
          },
        },
      });

      res.status(200).json({
        success: true,
        data: { artist: updatedArtist },
        message: 'Artist updated successfully',
      });
    } catch (error) {
      throw error;
    }
  },

  // Delete artist (soft delete - set active=false) (admin only)
  delete: async (req: any, res: Response) => {
    try {
      const { id } = req.params;

      const artist = await prisma.artist.update({
        where: { id },
        data: { active: false },
      });

      res.status(200).json({
        success: true,
        data: { artist },
        message: 'Artist deactivated successfully',
      });
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Artist not found',
          code: 'ARTIST_NOT_FOUND',
        });
      }
      throw error;
    }
  },

  // Get artist metrics with filters
  getMetrics: async (req: any, res: Response) => {
    try {
      const { artistId } = req.params;
      const { platform, dateFrom, dateTo } = req.query;

      // Check artist exists
      const artist = await prisma.artist.findUnique({
        where: { id: artistId },
      });

      if (!artist) {
        return res.status(404).json({
          success: false,
          message: 'Artist not found',
          code: 'ARTIST_NOT_FOUND',
        });
      }

      const where: any = { artistId };

      if (platform) {
        where.platform = platform;
      }

      if (dateFrom || dateTo) {
        where.metricDate = {};
        if (dateFrom) where.metricDate.gte = new Date(dateFrom as string);
        if (dateTo) where.metricDate.lte = new Date(dateTo as string);
      }

      const metrics = await prisma.platformMetric.findMany({
        where,
        orderBy: { metricDate: 'desc' },
        take: 1000,
      });

      res.status(200).json({
        success: true,
        data: { metrics },
      });
    } catch (error) {
      throw error;
    }
  },

  // Get artist concerts
  getConcerts: async (req: any, res: Response) => {
    try {
      const { artistId } = req.params;

      const concerts = await prisma.concert.findMany({
        where: { artistId },
        orderBy: { concertDate: 'desc' },
        take: 100,
      });

      res.status(200).json({
        success: true,
        data: { concerts },
      });
    } catch (error) {
      throw error;
    }
  },

  // Get artist demographics
  getDemographics: async (req: any, res: Response) => {
    try {
      const { artistId } = req.params;
      const { dimension } = req.query;

      const where: any = {
        artistId,
      };

      if (dimension) {
        where.dimension = dimension;
      }

      const demographics = await prisma.audienceDemographic.findMany({
        where,
        orderBy: { metricDate: 'desc' },
        take: 100,
      });

      res.status(200).json({
        success: true,
        data: { demographics },
      });
    } catch (error) {
      throw error;
    }
  },

/**
 * Full Artist Analytics Card
 */
getArtistAnalyticsCard: async (
  req: any,
  res: Response
) => {
  try {
    const { artistId } = req.params;

    const artist = await prisma.artist.findUnique({
      where: { id: artistId },

      include: {
        concerts: true,

        platformMetrics: {
          orderBy: {
            metricDate: 'desc',
          },
        },

        audienceDemographics: true,

        genres: {
          include: {
            genre: true,
          },
        },
      },
    });

    if (!artist) {
      return res.status(404).json({
        success: false,
        message: 'Artist not found',
      });
    }

    const totalRevenue =
      artist.concerts.reduce(
        (sum, concert) =>
          sum +
          Number(
            concert.totalRevenue || 0
          ),

        0
      );

    const ticketsSold =
      artist.concerts.reduce(
        (sum, concert) =>
          sum +
          Number(
            concert.ticketsSold || 0
          ),

        0
      );

    const totalFollowers =
      Number(
        artist.instagramFollowers || 0
      ) +
      Number(
        artist.youtubeSubscribers || 0
      ) +
      Number(
        artist.spotifyMonthlyListeners || 0
      ) +
      Number(
        artist.facebookFollowers || 0
      ) +
      Number(
        artist.appleMusicListeners || 0
      );

    const latestMetrics =
      artist.platformMetrics.slice(0, 30);

    const avgRoG =
      latestMetrics.length > 0
        ? latestMetrics.reduce(
            (sum, metric) =>
              sum +
              Number(
                metric.rogMonthly || 0
              ),

            0
          ) / latestMetrics.length
        : 0;

    const platformBreakdown = {
      instagram: Number(
        artist.instagramFollowers || 0
      ),

      youtube: Number(
        artist.youtubeSubscribers || 0
      ),

      spotify: Number(
        artist.spotifyMonthlyListeners || 0
      ),

      facebook: Number(
        artist.facebookFollowers || 0
      ),

      appleMusic: Number(
        artist.appleMusicListeners || 0
      ),
    };

    const topPlatform =
      Object.entries(platformBreakdown).sort(
        (a, b) => b[1] - a[1]
      )[0]?.[0] || null;

    const demographics =
      artist.audienceDemographics;

    return res.status(200).json({
      success: true,

      data: {
        artist: {
          id: artist.id,

          artistName:
            artist.artistName,

          photoUrl: artist.photoUrl,

          genres:
            artist.genres.map(
              (g) => g.genre.name
            ),

          age: artist.age,

          nationality:
            artist.nationality,
        },

        analytics: {
          growthPercentage:
            Number(avgRoG.toFixed(2)),

          totalRevenue,

          ticketsSold,

          concerts:
            artist.concerts.length,

          totalFollowers,

          topPlatform,

          platformBreakdown,

          growthTrend:
            latestMetrics.map(
              (metric) => ({
                date:
                  metric.metricDate,

                platform:
                  metric.platform,

                rog:
                  metric.rogMonthly,
              })
            ),

          concertList:
            artist.concerts,

          demographics,
        },
      },
    });
  } catch (error) {
    throw error;
  }
},

};

export default artistController;
