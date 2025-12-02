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

        // Get provider
        const { data: provider, error: providerError } = await supabaseAdmin
            .from('providers')
            .select('id, business_name')
            .eq('user_id', user.id)
            .single()

        if (providerError || !provider) {
            return res.status(404).json({ error: 'Provider not found' })
        }

        const { booking_id, counter_price, message } = req.body

        if (!booking_id || !counter_price) {
            return res.status(400).json({ error: 'Missing required fields' })
        }

        if (counter_price <= 0) {
            return res.status(400).json({ error: 'Invalid counter price' })
        }

        // Get booking
        const { data: booking, error: bookingError } = await supabaseAdmin
            .from('bookings')
            .select('*, service:services(*), user:users(*)')
            .eq('id', booking_id)
            .eq('provider_id', provider.id)
            .single()

        if (bookingError || !booking) {
            return res.status(404).json({ error: 'Booking not found or not assigned to you' })
        }

        if (booking.quote_status !== 'user_quoted') {
            return res.status(400).json({ error: 'This booking does not have a pending user quote' })
        }

        // Send counter-offer
        const { error: updateError } = await supabaseAdmin
            .from('bookings')
            .update({
                provider_counter_price: counter_price,
                quote_status: 'provider_countered',
                status: 'quote_sent'
            })
            .eq('id', booking_id)

        if (updateError) throw updateError

        // Record in quote negotiations history
        await supabaseAdmin
            .from('quote_negotiations')
            .insert({
                booking_id,
                quoted_by: 'provider',
                quoted_price: counter_price,
                message: message || 'Provider counter-offer',
                status: 'pending'
            })

        // Notify user
        await supabaseAdmin
            .from('notifications')
            .insert({
                user_id: booking.user_id,
                title: 'Counter-Offer Received',
                message: `${provider.business_name} counter-offered ₹${counter_price}. You quoted ₹${booking.user_quoted_price}.`,
                type: 'booking',
                reference_id: booking_id
            })

        return res.status(200).json({
            success: true,
            message: 'Counter-offer sent successfully',
            counter_price
        })
    } catch (error) {
        console.error('Negotiate quote error:', error)
        return res.status(500).json({ error: error.message })
    }
}
