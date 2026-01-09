import { supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { city_id, limit = 20 } = req.query

    let query = supabase
      .from('services')
      .select(`
        *,
        category:service_categories(*),
        bookings_count:bookings(count)
      `)
      .eq('is_active', true)

    if (city_id) {
      query = query.eq('city_id', city_id)
    }

    const { data: services, error } = await query
      .order('created_at', { ascending: false })
      .limit(parseInt(limit))

    if (error) throw error

    // Calculate trending and new flags
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const enrichedServices = services.map(service => {
      const createdAt = new Date(service.created_at)
      const bookingsCount = service.bookings_count?.[0]?.count || 0

      return {
        ...service,
        is_new: createdAt > sevenDaysAgo,
        is_trending: bookingsCount > 10,
        total_bookings: bookingsCount
      }
    })

    // Sort by priority: trending > new > others
    enrichedServices.sort((a, b) => {
      if (a.is_trending && !b.is_trending) return -1
      if (!a.is_trending && b.is_trending) return 1
      if (a.is_new && !b.is_new) return -1
      if (!a.is_new && b.is_new) return 1
      return b.total_bookings - a.total_bookings
    })

    res.status(200).json({ services: enrichedServices })
  } catch (error) {
    console.error('Error fetching services:', error)
    res.status(500).json({ error: error.message })
  }
}
