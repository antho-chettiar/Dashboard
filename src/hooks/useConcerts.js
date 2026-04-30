import { useQuery } from '@tanstack/react-query'
import client from '../api/client'

/**
 * Hook to fetch concerts with optional filters.
 * Supports filtering by city and optional date range.
 * Returns data, loading, and error states.
 */
export function useConcerts({ city, startDate, endDate, limit } = {}) {
  // Build query string based on provided filters
  const params = new URLSearchParams()
  if (city && city !== 'All') params.append('city', city)
  if (startDate) params.append('startDate', startDate)
  if (endDate) params.append('endDate', endDate)
  if (limit) params.append('limit', limit)
  const queryString = params.toString() ? `?${params.toString()}` : ''

  const { data, isLoading, error } = useQuery({
    queryKey: ['concerts', city, startDate, endDate],
    queryFn: async () => {
      const response = await client.get(`/concerts${queryString}`)
      // Expect response.data.concerts (array) – transform to UI shape
      const concerts = response?.data?.concerts || []
      return concerts.map(c => ({
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
        lat: c.lat,
        lng: c.lng,
        sponsors: c.sponsors || [],
      }))
    },
    staleTime: 5 * 60 * 1000,
    // Only fetch when component is mounted
    enabled: true,
  })

  return { data, isLoading, error }
}
