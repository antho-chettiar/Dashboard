import React from 'react'
import { useQuery } from '@tanstack/react-query'
import client from '../api/client'
import useAuthStore from '../store/useAuthStore'

export function useDashboardData({ timeFilter = 12 } = {}) {
  const token = useAuthStore((state) => state.token)

  // Fetch KPIs
  const { data: kpisData, isLoading: kpisLoading, error: kpisError } = useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: async () => {
      const response = await client.get('/dashboard/kpis')
      return response.data.data.kpis
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  })

  // Fetch top artists (get a larger pool to allow filtering by type)
  const { data: topArtistsData, isLoading: topArtistsLoading, error: topArtistsError } = useQuery({
    queryKey: ['dashboard', 'top-artists'],
    queryFn: async () => {
      const response = await client.get('/dashboard/top-artists?limit=100')
      return response.data.data.artists || []
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!kpisData && !!token,
  })

  // Fetch follower trends per platform
  const { data: instagramTrends, isLoading: instagramLoading } = useQuery({
    queryKey: ['analytics', 'trends', 'instagram'],
    queryFn: async () => {
      const response = await client.get('/analytics/trends?metric=followers&platform=instagram')
      return response.data.data?.trends || []
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!token,
  })

  const { data: youtubeTrends, isLoading: youtubeLoading } = useQuery({
    queryKey: ['analytics', 'trends', 'youtube'],
    queryFn: async () => {
      const response = await client.get('/analytics/trends?metric=followers&platform=youtube')
      return response.data.data?.trends || []
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!token,
  })

  const { data: spotifyTrends, isLoading: spotifyLoading } = useQuery({
    queryKey: ['analytics', 'trends', 'spotify'],
    queryFn: async () => {
      const response = await client.get('/analytics/trends?metric=followers&platform=spotify')
      return response.data.data?.trends || []
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!token,
  })

  // Fetch genre data
  const { data: genresData, isLoading: genresLoading, error: genresError } = useQuery({
    queryKey: ['analytics', 'genres'],
    queryFn: async () => {
      const response = await client.get('/analytics/genres')
      return response.data.data?.genres || []
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!token,
  })

  // Fetch all artists for artistType mapping (limited to 1000)
  const { data: allArtistsRaw } = useQuery({
    queryKey: ['artists', 'all-for-dashboard'],
    queryFn: async () => {
      const response = await client.get('/artists?limit=1000')
      return response.data.data.artists || []
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!token,
  })

  // Fetch all concerts for revenue aggregation and totalConcerts calculation
  const { data: allConcertsRaw } = useQuery({
    queryKey: ['concerts', 'all-for-dashboard'],
    queryFn: async () => {
      const response = await client.get('/concerts?limit=1000')
      return response.data.data.concerts || []
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!token,
  })

  // Fetch demographics data
  const { data: ageDemographicsData, isLoading: ageLoading } = useQuery({
    queryKey: ['analytics', 'demographics', 'age'],
    queryFn: async () => {
      const response = await client.get('/analytics/demographics/age')
      return response.data.data.breakdown || []
    },
    staleTime: 15 * 60 * 1000,
    enabled: !!token,
  })

  const { data: genderDemographicsData, isLoading: genderLoading } = useQuery({
    queryKey: ['analytics', 'demographics', 'gender'],
    queryFn: async () => {
      const response = await client.get('/analytics/demographics/gender')
      return response.data.data.breakdown || []
    },
    staleTime: 15 * 60 * 1000,
    enabled: !!token,
  })

  const isLoading = kpisLoading || topArtistsLoading || instagramLoading || youtubeLoading || spotifyLoading || genresLoading || ageLoading || genderLoading
  const error = kpisError

  // Build artistId -> type map
  const artistTypeById = React.useMemo(() => {
    if (!allArtistsRaw) return {}
    const map = {}
    allArtistsRaw.forEach(artist => {
      const nationality = artist.nationality || ''
      const type = nationality.toLowerCase().includes('india') ? 'indian' : 'international'
      map[artist.id] = type
    })
    return map
  }, [allArtistsRaw])

  // Build artistId -> name map
  const artistNameMap = React.useMemo(() => {
    if (!allArtistsRaw) return {}
    const map = {}
    allArtistsRaw.forEach(artist => {
      map[artist.id] = artist.name
    })
    return map
  }, [allArtistsRaw])

  // Transform KPIs
  const kpis = kpisData ? {
    totalArtists: kpisData.totalArtists || 0,
    totalConcerts: kpisData.totalConcerts || 0,
    ticketsSoldYTD: kpisData.ticketsSoldYTD || 0,
    revenueYTD: kpisData.revenueYTD || 0,
    avgRoG: kpisData.avgRoGDaily ? parseFloat(kpisData.avgRoGDaily.toFixed(2)) : 0,
    topArtistByStreams: kpisData.topArtistByStreams || null,
  } : null

  // Transform top artists pool
  const transformedArtistsPool = React.useMemo(() => {
    if (!topArtistsData) return []

    return topArtistsData.map(item => {
      const artist = item.artist
      const nationality = artist.nationality || ''
      const genres = artist.genres || []
      const type = artistTypeById[artist.id] || 'international'
      const genre = genres.length > 0 ? genres[0].genre.name : 'Unknown'

      const followers = { instagram: 0, youtube: 0, spotify: 0, facebook: 0, applemusic: 0 }
      const rog = { instagram: 0, youtube: 0, spotify: 0, facebook: 0, applemusic: 0 }

      if (item.platforms && Array.isArray(item.platforms)) {
        item.platforms.forEach(p => {
          const key = p.platform.toLowerCase()
          if (key in followers) {
            followers[key] = p.followers || 0
          }
        })
      }

      const popularity = Math.min(100, Math.round((item.totalFollowers || 0) / 1000000))
      const monthlyStreams = Math.round(item.totalFollowers * 0.001)
      const photo = artist.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&background=6366F1&color=fff`

      return {
        id: artist.id,
        name: artist.name,
        type,
        genre,
        nationality,
        age: 0,
        totalConcerts: 0,
        popularity,
        monthlyStreams,
        followers,
        rog,
        photo,
        totalFollowers: item.totalFollowers || 0,
      }
    })
  }, [topArtistsData, artistTypeById])

  // Compute totalConcerts per artist from allConcerts
  const artistConcertCounts = React.useMemo(() => {
    if (!allConcertsRaw) return {}
    const counts = {}
    allConcertsRaw.forEach(concert => {
      const artistId = concert.artistId
      counts[artistId] = (counts[artistId] || 0) + 1
    })
    return counts
  }, [allConcertsRaw])

  const topArtistsWithConcerts = React.useMemo(() => {
    if (!transformedArtistsPool.length) return []
    return transformedArtistsPool.map(artist => ({
      ...artist,
      totalConcerts: artistConcertCounts[artist.id] || 0,
    }))
  }, [transformedArtistsPool, artistConcertCounts])

  // Transform age demographics
  const ageData = React.useMemo(() => {
    if (!ageDemographicsData) return []
    return ageDemographicsData.map(item => ({
      name: capitalize(item.dimensionValue),
      value: Math.round(item._avg?.percentage || 0),
    }))
  }, [ageDemographicsData])

  // Transform gender demographics
  const genderData = React.useMemo(() => {
    if (!genderDemographicsData) return []
    return genderDemographicsData.map(item => ({
      name: capitalize(item.dimensionValue),
      value: Math.round(item._avg?.percentage || 0),
    }))
  }, [genderDemographicsData])

  // M1: Combine trends into followerTrends with year-disambiguated keys
  // Key format: "Jan 2025" (used for dedup/sort), display label: "Jan 25"
  const followerTrends = React.useMemo(() => {
    // Map keyed by "Mon YYYY" to avoid cross-year collisions
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

    return Array.from(trendMap.values())
      .sort((a, b) => a._sortKey - b._sortKey)
      .map(({ _sortKey, ...rest }) => rest) // strip internal sort key before returning
  }, [instagramTrends, youtubeTrends, spotifyTrends])

  // Transform genres
  const genreData = React.useMemo(() => {
    if (!genresData) return []
    return genresData.map(g => ({
      genre: g.genreName,
      streams: g.totalFollowers,
    }))
  }, [genresData])

  // Transform concerts to match UI format
  const transformedConcerts = React.useMemo(() => {
    if (!allConcertsRaw) return []
    return allConcertsRaw.map(c => ({
      id: c.id,
      artistId: c.artistId,
      artist: c.artist?.name || 'Unknown Artist',
      name: c.concertName,
      date: new Date(c.concertDate),
      city: c.city,
      state: c.state,
      country: c.country,
      venue: c.venueName,
      capacity: c.capacity,
      tickets_sold: c.ticketsSold,
      avg_ticket_price: c.avgTicketPrice,
      total_revenue: c.totalRevenue,
      lat: c.lat || 0,
      lng: c.lng || 0,
      sponsors: c.sponsors || [],
    }))
  }, [allConcertsRaw])

  return {
    data: {
      kpis,
      topArtistsPool: topArtistsWithConcerts,
      allConcerts: transformedConcerts,
      allArtists: allArtistsRaw,
      followerTrends,
      genres: genreData,
      ageData,
      genderData,
      artistIdToType: artistTypeById,
    },
    isLoading,
    error,
    isKpisLoading: kpisLoading,
    isTopArtistsLoading: topArtistsLoading,
    isConcertsLoading: allConcertsRaw === undefined,
    isTrendsLoading: instagramLoading || youtubeLoading || spotifyLoading,
    isGenresLoading: genresLoading,
    isDemographicsLoading: ageLoading || genderLoading,
  }
}

function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}