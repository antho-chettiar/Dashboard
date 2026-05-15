import { prisma } from '../../utils/database';

export const analysisMetrics = {
  /**
   * Artist profitability prediction
   */
  predictArtistCityPerformance: async (
    artistId: string,
    city: string
  ) => {
    // Artist concerts in selected city
    const concerts = await prisma.concert.findMany({
      where: {
        artistId,
        city: {
          equals: city,
          mode: 'insensitive',
        },
      },
    });

    // Overall artist concerts
    const allConcerts = await prisma.concert.findMany({
      where: {
        artistId,
      },
    });

    const totalRevenue = concerts.reduce(
      (sum, concert) =>
        sum + Number(concert.totalRevenue || 0),
      0
    );

    const totalTicketsSold = concerts.reduce(
      (sum, concert) =>
        sum + Number(concert.ticketsSold || 0),
      0
    );

    const avgTicketPrice =
      totalTicketsSold > 0
        ? totalRevenue / totalTicketsSold
        : 0;

    const avgRevenue =
      concerts.length > 0
        ? totalRevenue / concerts.length
        : 0;

    const cityDemandIndex = Math.min(
      concerts.length * 10,
      100
    );

    const sellThroughRate =
      concerts.length > 0
        ? concerts.reduce(
            (sum, concert) => {
              const sold = Number(
                concert.ticketsSold || 0
              );

              const capacity = Number(
                concert.capacity || 0
              );

              if (capacity === 0) return sum;

              return sum + (sold / capacity) * 100;
            },
            0
          ) / concerts.length
        : 0;

    const revenueConfidence = Math.min(
      allConcerts.length * 5,
      100
    );

    const projectedROI =
      avgRevenue > 0
        ? ((avgRevenue - 500000) / 500000) * 100
        : 0;

    let profitability = 'LOW';

    if (projectedROI > 100) {
      profitability = 'VERY HIGH';
    } else if (projectedROI > 60) {
      profitability = 'HIGH';
    } else if (projectedROI > 20) {
      profitability = 'MID';
    }

    return {
      predictedRevenue: Math.round(avgRevenue),

      estimatedTicketsSold: Math.round(
        totalTicketsSold /
          (concerts.length || 1)
      ),

      avgTicketPrice: Math.round(
        avgTicketPrice
      ),

      projectedROI: Math.round(
        projectedROI
      ),

      performanceScores: {
        popularityScore: Math.min(
          totalTicketsSold / 1000,
          100
        ),

        cityDemandIndex: Math.round(
          cityDemandIndex
        ),

        sellThroughRate: Math.round(
          sellThroughRate
        ),

        revenueConfidence: Math.round(
          revenueConfidence
        ),
      },

      profitability,

      revenueBreakdown: {
        ticketRevenue: Math.round(
          avgRevenue * 0.85
        ),

        sponsorRevenue: Math.round(
          avgRevenue * 0.15
        ),
      },
    };
  },

  /**
   * Compare two artists
   */
  compareArtists: async (
    artist1Id: string,
    artist2Id: string
  ) => {
    const artists = await prisma.artist.findMany({
      where: {
        id: {
          in: [artist1Id, artist2Id],
        },
      },

      include: {
        concerts: true,
      },
    });

    const formatted = artists.map(
      (artist: any) => {
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

        const totalRevenue =
          artist.concerts.reduce(
            (sum: number, concert: any) =>
              sum +
              Number(
                concert.totalRevenue || 0
              ),

            0
          );

        const ticketsSold =
          artist.concerts.reduce(
            (sum: number, concert: any) =>
              sum +
              Number(
                concert.ticketsSold || 0
              ),

            0
          );

        return {
          id: artist.id,

          artistName: artist.artistName,

          totalFollowers,

          totalRevenue,

          ticketsSold,

          concerts:
            artist.concerts.length,

          platformBreakdown: {
            instagram: Number(
              artist.instagramFollowers || 0
            ),

            youtube: Number(
              artist.youtubeSubscribers || 0
            ),

            spotify: Number(
              artist.spotifyMonthlyListeners || 0
            ),
          },
        };
      }
    );

    return formatted;
  },
};