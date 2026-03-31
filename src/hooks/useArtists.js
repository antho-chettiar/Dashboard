import { useQuery } from '@tanstack/react-query'
import client from '../api/client'

export function useArtists({ search = '', genre = '', limit = 100 } = {}) {
  // Build query parameters
  const params = new URLSearchParams()
  if (search) params.append('search', search)
  if (genre && genre !== 'All') params.append('genre', genre)
  params.append('limit', limit.toString())

  // Fetch artists
  const { data: artistsData, isLoading: artistsLoading, error: artistsError } = useQuery({
    queryKey: ['artists', search, genre],
    queryFn: async () => {
      const response = await client.get(`/artists?${params.toString()}`)
      return response.data.data.artists
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  // Fetch all concerts (to count per artist)
  const { data: concertsData, isLoading: concertsLoading } = useQuery({
    queryKey: ['concerts', 'all'],
    queryFn: async () => {
      const response = await client.get('/concerts?limit=1000')
      return response.data.data.concerts
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!artistsData, // Only fetch if artists data is available
  })

  // Combine and transform data
  const transformedData = artistsData?.map(artist => {
    const artistConcerts = concertsData?.filter(c => c.artistId === artist.id) || []
    const totalConcerts = artistConcerts.length

    // Derive artist type from nationality
    const type = artist.nationality?.toLowerCase().includes('india') ? 'indian' : 'international'

    // Get primary genre
    const genre = artist.genres?.[0]?.genre?.name || 'Unknown'

    // Build followers object with default 0s for all platforms
    const followers = {
      instagram: 0,
      youtube: 0,
      spotify: 0,
      facebook: 0,
      applemusic: 0,
    }

    // Build RoG object (default all 0)
    const rog = {
      instagram: 0,
      youtube: 0,
      spotify: 0,
      facebook: 0,
      applemusic: 0,
    }

    return {
      id: artist.id,
      name: artist.name,
      type,
      genre,
      nationality: artist.nationality,
      age: 0, // Placeholder - not in DB
      totalConcerts,
      popularity: 0, // Placeholder - not in DB
      monthlyStreams: 0, // Placeholder - not in DB
      followers,
      rog,
      photo: artist.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&background=6366F1&color=fff`,
    }
  })

  return {
    data: transformedData,
    isLoading: artistsLoading,
    error: artistsError,
    isConcertsLoading: concertsLoading,
  }
}