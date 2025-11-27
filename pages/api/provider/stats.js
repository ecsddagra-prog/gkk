import { supabaseAdmin } from '../../../lib/supabase'
import { requireProviderUser } from '../../../lib/api-auth'

export default async function handler(req, res) {
    try {
        const { provider } = await requireProviderUser(req)

        if (req.method === 'GET') {
            // 1. Fetch Bookings Stats
            const { data: bookings, error: bookingsError } = await supabaseAdmin
                .from('bookings')
                .select(`
                    id, 
                    status, 
                    final_price, 
                    payment_status, 
                    created_at, 
                    service:services(name)
                `)
                .eq('provider_id', provider.id)
                .order('created_at', { ascending: false })

            if (bookingsError) throw bookingsError

            // Calculate Stats
            let totalEarnings = 0
            let pendingEarnings = 0
            const orderCounts = {
                completed: 0,
                pending: 0,
                cancelled: 0,
                total: bookings.length
            }

            bookings.forEach(booking => {
                const price = parseFloat(booking.final_price || 0)

                if (booking.status === 'completed') {
                    orderCounts.completed++
                    totalEarnings += price
                } else if (booking.status === 'cancelled') {
                    orderCounts.cancelled++
                } else {
                    orderCounts.pending++
                    // Only count as pending earnings if not cancelled/completed
                    if (booking.status !== 'rejected') {
                        pendingEarnings += price
                    }
                }
            })

            // 2. Fetch Reviews
            const { data: reviews, error: reviewsError } = await supabaseAdmin
                .from('ratings')
                .select(`
                    id,
                    rating,
                    review_text,
                    created_at,
                    user:users(full_name)
                `)
                .eq('provider_id', provider.id)
                .order('created_at', { ascending: false })
                .limit(10)

            if (reviewsError) throw reviewsError

            return res.status(200).json({
                stats: {
                    totalEarnings,
                    pendingEarnings,
                    orderCounts
                },
                recentTransactions: bookings.filter(b => b.status === 'completed').slice(0, 5),
                recentReviews: reviews || []
            })
        }

        res.setHeader('Allow', ['GET'])
        res.status(405).end(`Method ${req.method} Not Allowed`)

    } catch (error) {
        console.error('Provider stats error:', error)
        res.status(error.status || 500).json({ error: error.message })
    }
}
