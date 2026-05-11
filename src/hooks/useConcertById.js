import { useQuery } from '@tanstack/react-query'
import client from '../api/client'

/**
 * Hook to fetch a single concert by ID.
 * Returns concert data with proper error handling.
 */
export function useConcertById(id) {
  const { data, isLoading, error, isError } = useQuery({
    queryKey: ['concert', id],
    queryFn: async () => {
      if (!id) return null

      const response = await client.get(`/concerts/${id}`)

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch concert')
      }

      const concert = response.data.data.concert

      // Transform to match expected format
      return {
        id: concert.id,
        artistId: concert.artistId,
        artist: concert.artist?.name || 'Unknown Artist',
        name: concert.concertName || concert.name,
        date: new Date(concert.concertDate),
        city: concert.city,
        state: concert.state,
        country: concert.country,
        venue: concert.venueName,
        capacity: concert.capacity,
        tickets_sold: concert.ticketsSold,
        avg_ticket_price: concert.avgTicketPrice,
        total_revenue: concert.totalRevenue,
        lat: concert.lat,
        lng: concert.lng,
        sponsors: concert.sponsors || [],
        audienceDemographics: concert.audienceDemographics || [],
      }
    },
    enabled: !!id, // Only run if id is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return { data, isLoading, error, isError }
}