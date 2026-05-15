import { useQuery } from '@tanstack/react-query';

import analyticsService from '../services/analyticsService';

/*
 * DASHBOARD
 */

export const useDashboardKPIs =
  () => {
    return useQuery({
      queryKey: ['dashboard-kpis'],

      queryFn:
        analyticsService.getDashboardKPIs,
    });
  };

export const useRevenuePerCity =
  () => {
    return useQuery({
      queryKey: ['revenue-per-city'],

      queryFn:
        analyticsService.getRevenuePerCity,
    });
  };

export const useAgeDistribution =
  () => {
    return useQuery({
      queryKey: ['age-distribution'],

      queryFn:
        analyticsService.getAgeDistribution,
    });
  };

export const useGenderDistribution =
  () => {
    return useQuery({
      queryKey: [
        'gender-distribution',
      ],

      queryFn:
        analyticsService.getGenderDistribution,
    });
  };

export const useGenrePopularity =
  () => {
    return useQuery({
      queryKey: ['genre-popularity'],

      queryFn:
        analyticsService.getGenrePopularity,
    });
  };

/*
 * ARTISTS
 */

export const useArtists = (
  params?: any
) => {
  return useQuery({
    queryKey: ['artists', params],

    queryFn: () =>
      analyticsService.getArtists(
        params
      ),
  });
};

export const useArtistAnalyticsCard =
  (artistId: string) => {
    return useQuery({
      queryKey: [
        'artist-analytics-card',
        artistId,
      ],

      queryFn: () =>
        analyticsService.getArtistAnalyticsCard(
          artistId
        ),

      enabled: !!artistId,
    });
  };

/*
 * ANALYSIS
 */

export const useProfitabilityPrediction =
  (
    artistId: string,
    city: string
  ) => {
    return useQuery({
      queryKey: [
        'profitability-prediction',
        artistId,
        city,
      ],

      queryFn: () =>
        analyticsService.getProfitabilityPrediction(
          artistId,
          city
        ),

      enabled:
        !!artistId && !!city,
    });
  };

export const useCompareArtists =
  (
    artist1Id: string,
    artist2Id: string
  ) => {
    return useQuery({
      queryKey: [
        'compare-artists',
        artist1Id,
        artist2Id,
      ],

      queryFn: () =>
        analyticsService.compareArtists(
          artist1Id,
          artist2Id
        ),

      enabled:
        !!artist1Id &&
        !!artist2Id,
    });
  };