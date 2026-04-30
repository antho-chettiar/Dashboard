import { useQuery } from '@tanstack/react-query'
import client from '../api/client'

export function useTrends() {
  // Fetch follower trends per platform
  const { data: instagramTrends, isLoading: isInstaLoading, error: instaError } = useQuery({
    queryKey: ['analytics', 'trends', 'instagram'],
    queryFn: async () => {
      const response = await client.get('/analytics/trends?metric=followers&platform=instagram')
      return response.data.data?.trends || []
    },
    staleTime: 10 * 60 * 1000,
  })

  const { data: youtubeTrends, isLoading: isYtLoading, error: ytError } = useQuery({
    queryKey: ['analytics', 'trends', 'youtube'],
    queryFn: async () => {
      const response = await client.get('/analytics/trends?metric=followers&platform=youtube')
      return response.data.data?.trends || []
    },
    staleTime: 10 * 60 * 1000,
  })

  const { data: spotifyTrends, isLoading: isSpotLoading, error: spotError } = useQuery({
    queryKey: ['analytics', 'trends', 'spotify'],
    queryFn: async () => {
      const response = await client.get('/analytics/trends?metric=followers&platform=spotify')
      return response.data.data?.trends || []
    },
    staleTime: 10 * 60 * 1000,
  })

  const isLoading = isInstaLoading || isYtLoading || isSpotLoading
  const error = instaError || ytError || spotError

  // Combine trends into followerTrends with year-disambiguated keys
  // Key format: "Jan 2025" (used for dedup/sort), display label: "Jan 25"
  const followerTrends = []
  
  if (!isLoading && !error) {
    const trendMap = new Map()

    const addTrends = (data, platform) => {
      if (!data || !Array.isArray(data)) return
      data.forEach(metric => {
        const date = new Date(metric.metricDate)
        const year = date.getFullYear()
        const monthShort = date.toLocaleDateString('en-US', { month: 'short' })
        const mapKey = `${monthShort} ${year}`                   // dedup key — unique across years
        const displayLabel = `${monthShort} '${String(year).slice(2)}` // display: "Jan '25"

        if (!trendMap.has(mapKey)) {
          trendMap.set(mapKey, {
            date: displayLabel,
            _sortKey: date.getFullYear() * 100 + date.getMonth(), // numeric for correct sort
            instagram: 0,
            youtube: 0,
            spotify: 0,
          })
        }
        trendMap.get(mapKey)[platform] += metric.followers || 0
      })
    }

    addTrends(instagramTrends, 'instagram')
    addTrends(youtubeTrends, 'youtube')
    addTrends(spotifyTrends, 'spotify')

    followerTrends.push(...Array.from(trendMap.values())
      .sort((a, b) => a._sortKey - b._sortKey)
      .map(({ _sortKey, ...rest }) => rest))
  }

  return {
    data: followerTrends,
    isLoading,
    error,
  }
}
