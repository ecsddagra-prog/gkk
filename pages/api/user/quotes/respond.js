import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase admin client not configured' })
    }

    try {
        const authHeader = req.headers.authorization
        if (!authHeader) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const { booking_id, action } = req.body

        if (!booking_id || !action) {
            return res.status(400).json({ error: 'Missing required fields' })
        }

        if (!['accept', 'reject'].includes(action)) {
            return res.status(400).json({ error: 'Invalid action. Must be "accept" or "reject"' })
        }

        // Get booking
        const { data: booking, error: bookingError } = await supabaseAdmin
            .from('bookings')
            .select('*, service:services(*), provider:providers(*, user:users(*))')
            .eq('id', booking_id)
            .eq('user_id', user.id)
            .single()

        if (bookingError || !booking) {
            return res.status(404).json({ error: 'Booking not found' })
        }

        if (booking.quote_status !== 'provider_countered') {
            return res.status(400).json({ error: 'No pending provider counter-offer for this booking' })
        }

        if (!booking.provider_counter_price) {
            return res.status(400).json({ error: 'Provider counter price not found' })
        }

        if (action === 'accept') {
            // User accepts provider's counter-offer
            const { error: updateError } = await supabaseAdmin
                .from('bookings')
                .update({
                    final_agreed_price: booking.provider_counter_price,
                    quote_status: 'accepted',
                    status: 'accepted'
                })
                .eq('id', booking_id)

            if (updateError) throw updateError

            // Update quote negotiation history
            await supabaseAdmin
                .from('quote_negotiations')
                .update({ status: 'accepted' })
                .eq('booking_id', booking_id)
                .eq('quoted_by', 'provider')
                .eq('status', 'pending')

            // Notify provider
            if (booking.provider?.user?.id) {
                await supabaseAdmin
                    .from('notifications')
                    .insert({
                        user_id: booking.provider.user.id,
                        title: 'Counter-Offer Accepted',
                        message: `Customer accepted your counter-offer of ₹${booking.provider_counter_price}`,
                        type: 'booking',
                        reference_id: booking_id
                    })
            }

            return res.status(200).json({
                success: true,
                message: 'Counter-offer accepted',
                final_price: booking.provider_counter_price
            })
        }

        if (action === 'reject') {
            // User rejects provider's counter-offer
            const { error: updateError } = await supabaseAdmin
                .from('bookings')
                .update({
                    quote_status: 'rejected',
                    status: 'cancelled'
                })
                .eq('id', booking_id)

            if (updateError) throw updateError

            // Update quote negotiation history
            await supabaseAdmin
                .from('quote_negotiations')
                .update({ status: 'rejected' })
                .eq('booking_id', booking_id)
                .eq('quoted_by', 'provider')
                .eq('status', 'pending')

            // Notify provider
            if (booking.provider?.user?.id) {
                await supabaseAdmin
                    .from('notifications')
                    .insert({
                        user_id: booking.provider.user.id,
                        title: 'Counter-Offer Rejected',
                        message: `Customer rejected your counter-offer of ₹${booking.provider_counter_price}`,
                        type: 'booking',
                        reference_id: booking_id
                    })
            }

            return res.status(200).json({
                success: true,
                message: 'Counter-offer rejected'
            })
        }
    } catch (error) {
        console.error('Quote response error:', error)
        return res.status(500).json({ error: error.message })
    }
}
