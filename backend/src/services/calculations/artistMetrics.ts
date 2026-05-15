export const artistMetrics = {
  /**
   * Total followers across all platforms
   */
  calculateTotalFollowers: (platforms: {
    instagram?: number;
    youtube?: number;
    spotify?: number;
    facebook?: number;
    appleMusic?: number;
    twitter?: number;
  }) => {
    return (
      (platforms.instagram || 0) +
      (platforms.youtube || 0) +
      (platforms.spotify || 0) +
      (platforms.facebook || 0) +
      (platforms.appleMusic || 0) +
      (platforms.twitter || 0)
    );
  },

  /**
   * Average ROG
   */
  calculateAverageROG: (values: number[]) => {
    if (!values.length) return 0;

    const total = values.reduce((sum, val) => sum + val, 0);

    return Number((total / values.length).toFixed(2));
  },

  /**
   * Find top platform by followers
   */
  getTopPlatform: (platforms: {
    instagram?: number;
    youtube?: number;
    spotify?: number;
    facebook?: number;
    appleMusic?: number;
    twitter?: number;
  }) => {
    const entries = [
      { platform: 'Instagram', value: platforms.instagram || 0 },
      { platform: 'YouTube', value: platforms.youtube || 0 },
      { platform: 'Spotify', value: platforms.spotify || 0 },
      { platform: 'Facebook', value: platforms.facebook || 0 },
      { platform: 'Apple Music', value: platforms.appleMusic || 0 },
      { platform: 'Twitter', value: platforms.twitter || 0 },
    ];

    entries.sort((a, b) => b.value - a.value);

    return entries[0];
  },

  /**
   * Growth %
   */
  calculateGrowthPercentage: (
    previousValue: number,
    currentValue: number
  ) => {
    if (previousValue <= 0) return 0;

    return Number(
      (
        ((currentValue - previousValue) / previousValue) *
        100
      ).toFixed(2)
    );
  },

  /**
   * Popularity score
   */
  calculatePopularityScore: (
    totalFollowers: number,
    avgROG: number
  ) => {
    const score =
      totalFollowers * 0.00001 +
      avgROG * 5;

    return Number(Math.min(score, 100).toFixed(2));
  },

  /**
   * Revenue Score
   */
  calculateRevenueScore: (
    revenue: number
  ) => {
    if (revenue >= 100000000) return 100;
    if (revenue >= 50000000) return 85;
    if (revenue >= 10000000) return 70;
    if (revenue >= 5000000) return 55;
    return 35;
  },
};