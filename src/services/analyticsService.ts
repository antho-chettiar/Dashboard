import api from "../api/client";

export const analyticsService = {
  /*
   * DASHBOARD
   */

  getDashboardKPIs: async () => {
    const response = await api.get(
      '/dashboard/kpis'
    );

    return response.data;
  },

  getRevenuePerCity: async () => {
    const response = await api.get(
      '/dashboard/revenue-per-city'
    );

    return response.data;
  },

  getAgeDistribution: async () => {
    const response = await api.get(
      '/dashboard/age-distribution'
    );

    return response.data;
  },

  getGenderDistribution: async () => {
    const response = await api.get(
      '/dashboard/gender-distribution'
    );

    return response.data;
  },

  getGenrePopularity: async () => {
    const response = await api.get(
      '/dashboard/genre-popularity'
    );

    return response.data;
  },

  /*
   * ARTISTS
   */

  getArtists: async (
    params?: any
  ) => {
    const response = await api.get(
      '/artists',
      { params }
    );

    return response.data;
  },

  getArtistAnalyticsCard: async (
    artistId: string
  ) => {
    const response = await api.get(
      `/artists/${artistId}/analytics-card`
    );

    return response.data;
  },

  /*
   * ANALYSIS
   */

  getProfitabilityPrediction:
    async (
      artistId: string,
      city: string
    ) => {
      const response =
        await api.get(
          '/analytics/profitability-predictor',
          {
            params: {
              artistId,
              city,
            },
          }
        );

      return response.data;
    },

  compareArtists: async (
    artist1Id: string,
    artist2Id: string
  ) => {
    const response =
      await api.get(
        '/analytics/compare-artists',
        {
          params: {
            artist1Id,
            artist2Id,
          },
        }
      );

    return response.data;
  },
};

export default analyticsService;