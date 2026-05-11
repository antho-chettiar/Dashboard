import { Response } from 'express';
import { prisma } from '../utils/database';
import { CreateConcertInput, UpdateConcertInput } from '../validations/zodSchemas';

export const concertController = {
  // List concerts with pagination and filters
  list: async (req: any, res: Response) => {
    try {
      const {
        page = 1,
        limit = 50,
        artistId,
        city,
        country,
        // Accept both naming conventions: dateFrom/dateTo (API) and startDate/endDate (frontend)
        dateFrom,
        dateTo,
        startDate,
        endDate,
      } = req.query;

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      // Build where clause
      const where: any = {};

      if (artistId) where.artistId = artistId;
      if (city) where.city = { contains: city as string, mode: 'insensitive' };
      if (country) where.country = { contains: country as string, mode: 'insensitive' };

      // Resolve effective date range from either param name
      const effectiveDateFrom = (dateFrom || startDate) as string | undefined;
      const effectiveDateTo = (dateTo || endDate) as string | undefined;

      if (effectiveDateFrom || effectiveDateTo) {
        where.concertDate = {};
        if (effectiveDateFrom) where.concertDate.gte = new Date(effectiveDateFrom);
        if (effectiveDateTo) where.concertDate.lte = new Date(effectiveDateTo);
      }

      const [concerts, total] = await Promise.all([
        prisma.concert.findMany({
          where,
          include: {
            artist: {
              select: {
                id: true,
                artistName: true,  // actual field name in Artist model
                nationality: true,
              },
            },
          },
          orderBy: { concertDate: 'desc' },
          skip,
          take: parseInt(limit as string),
        }),
        prisma.concert.count({ where }),
      ]);

      // Transform response:
      // - alias artistName -> name on artist object (frontend reads artist.name)
      // - add concertName (artistName column repurposed; fallback null)
      // - add lat/lng aliases for latitude/longitude
      const transformedConcerts = concerts.map((c: any) => ({
        ...c,
        concertName: c.artistName ?? null,
        lat: c.latitude !== null && c.latitude !== undefined ? Number(c.latitude) : null,
        lng: c.longitude !== null && c.longitude !== undefined ? Number(c.longitude) : null,
        artist: c.artist
          ? { ...c.artist, name: c.artist.artistName }
          : null,
      }));

      res.status(200).json({
        success: true,
        data: {
          concerts: transformedConcerts,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total,
            pages: Math.ceil(total / parseInt(limit as string)),
          },
        },
      });
    } catch (error) {
      throw error;
    }
  },

  // Get single concert by ID
  getById: async (req: any, res: Response) => {
    try {
      const { id } = req.params;

      const concert = await prisma.concert.findUnique({
        where: { id },
        include: {
          artist: {
            select: {
              id: true,
              artistName: true,  // actual field name in Artist model
              nationality: true,
            },
          },
          audienceDemographics: {
            orderBy: { metricDate: 'desc' },
          },
        },
      });

      if (!concert) {
        return res.status(404).json({
          success: false,
          message: 'Concert not found',
          code: 'CONCERT_NOT_FOUND',
        });
      }

      // Alias artistName -> name for frontend compatibility
      const result = concert as any;
      const concertData: any = {
        ...result,
        artist: result.artist ? { ...result.artist, name: result.artist.artistName } : null,
      };

      return res.status(200).json({
        success: true,
        data: { concert: concertData },
      });
    } catch (error) {
      throw error;
    }
  },

  // Create concert (admin only)
  create: async (req: any, res: Response) => {
    try {
      const input: CreateConcertInput = req.body;

      // Verify artist exists
      const artist = await prisma.artist.findUnique({
        where: { id: input.artistId },
      });

      if (!artist) {
        return res.status(400).json({
          success: false,
          message: 'Artist not found',
          code: 'ARTIST_NOT_FOUND',
        });
      }

      const concertDate = new Date(input.concertDate);

      // Sanitize: strip fields Prisma won't accept and convert null → undefined for non-nullable columns
      const { concertDate: _cd, ...rest } = input as any;
      const prismaData: any = {
        ...rest,
        concertDate,
        ticketsSold: input.ticketsSold ?? undefined,
      };

      const concert = await prisma.concert.create({
        data: prismaData,
        include: {
          artist: {
            select: {
              id: true,
              artistName: true,  // actual field name in Artist model
            },
          },
        },
      });

      // Alias artistName -> name for frontend compatibility
      const result = concert as any;
      const concertData: any = {
        ...result,
        artist: result.artist ? { ...result.artist, name: result.artist.artistName } : null,
      };

      return res.status(201).json({
        success: true,
        data: { concert: concertData },
        message: 'Concert created successfully',
      });
    } catch (error) {
      throw error;
    }
  },

  // Update concert (admin only)
  update: async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const input: UpdateConcertInput = req.body;

      // Check if concert exists
      const existing = await prisma.concert.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Concert not found',
          code: 'CONCERT_NOT_FOUND',
        });
      }

      const updateData: any = { ...input };
      if (input.concertDate) {
        updateData.concertDate = new Date(input.concertDate);
      }

      const concert = await prisma.concert.update({
        where: { id },
        data: updateData,
        include: {
          artist: {
            select: {
              id: true,
              artistName: true,  // actual field name in Artist model
            },
          },
        },
      });

      // Alias artistName -> name for frontend compatibility
      const result = concert as any;
      const concertData: any = {
        ...result,
        artist: result.artist ? { ...result.artist, name: result.artist.artistName } : null,
      };

      return res.status(200).json({
        success: true,
        data: { concert: concertData },
        message: 'Concert updated successfully',
      });
    } catch (error) {
      throw error;
    }
  },

  // Get cities with aggregated stats
  getCities: async (req: any, res: Response) => {
    try {
      const { country } = req.query;

      const where: any = {};
      if (country) {
        where.country = { contains: country as string, mode: 'insensitive' };
      }

      const cities = await prisma.concert.groupBy({
        by: ['city', 'state', 'country'],
        where,
        _sum: {
          ticketsSold: true,
          totalRevenue: true,
          capacity: true,
        },
        _count: {
          id: true,
        },
        orderBy: {
          _sum: {
            totalRevenue: 'desc',
          },
        },
        take: 50,
      });

      // Format response
      const formatted = cities.map((city) => ({
        city: city.city,
        state: city.state,
        country: city.country,
        concertCount: city._count.id,
        totalTicketsSold: city._sum.ticketsSold || 0,
        totalRevenue: city._sum.totalRevenue || 0,
        totalCapacity: city._sum.capacity || 0,
        avgTicketPrice: city._sum.totalRevenue && city._sum.ticketsSold && Number(city._sum.ticketsSold) > 0
          ? Number(city._sum.totalRevenue) / Number(city._sum.ticketsSold)
          : 0,
      }));

      res.status(200).json({
        success: true,
        data: { cities: formatted },
      });
    } catch (error) {
      throw error;
    }
  },

  // Get venues with aggregated stats
  getVenues: async (_req: any, res: Response) => {
    try {
      const venues = await prisma.concert.groupBy({
        by: ['venueName', 'city', 'country'],
        _sum: {
          ticketsSold: true,
          totalRevenue: true,
          capacity: true,
        },
        _count: {
          id: true,
        },
        orderBy: {
          _sum: {
            totalRevenue: 'desc',
          },
        },
        take: 50,
      });

      const formatted = venues.map((venue) => ({
        venueName: venue.venueName,
        city: venue.city,
        country: venue.country,
        concertCount: venue._count.id,
        totalTicketsSold: venue._sum.ticketsSold || 0,
        totalRevenue: venue._sum.totalRevenue || 0,
        avgTicketPrice: venue._sum.totalRevenue && venue._sum.ticketsSold && Number(venue._sum.ticketsSold) > 0
          ? Number(venue._sum.totalRevenue) / Number(venue._sum.ticketsSold)
          : 0,
      }));

      res.status(200).json({
        success: true,
        data: { venues: formatted },
      });
    } catch (error) {
      throw error;
    }
  },
};

export default concertController;
