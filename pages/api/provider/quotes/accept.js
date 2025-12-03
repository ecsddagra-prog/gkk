import { supabaseAdmin } from '../../../../lib/supabase'

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
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (providerError || !provider) {
            return res.status(404).json({ error: 'Provider not found' })
        }

        const { booking_id } = req.body

        if (!booking_id) {
            return res.status(400).json({ error: 'Missing booking_id' })
        }

        // Get booking - allow if assigned to provider OR unassigned
        const { data: booking, error: bookingError } = await supabaseAdmin
            .from('bookings')
            .select('*, service:services(*), user:users(*)')
            .eq('id', booking_id)
            .or(`provider_id.eq.${provider.id},provider_id.is.null`)
            .single()

        if (bookingError || !booking) {
            return res.status(404).json({ error: 'Booking not found or not available' })
        }

        // If booking is unassigned, assign to this provider
        if (!booking.provider_id) {
            const { error: assignError } = await supabaseAdmin
                .from('bookings')
                .update({ provider_id: provider.id })
                .eq('id', booking_id)

            if (assignError) {
                return res.status(500).json({ error: 'Failed to assign booking to provider' })
            }
        }

        if (booking.status !== 'quote_requested' && booking.quote_status !== 'user_quoted') {
            return res.status(400).json({ error: 'This booking does not have a pending user quote' })
        }

        // Accept the user's quoted price
        const { error: updateError } = await supabaseAdmin
            .from('bookings')
            .update({
                final_price: booking.user_quoted_price,
                quote_status: 'accepted',
                status: 'confirmed',
                provider_id: provider.id
            })
            .eq('id', booking_id)

        if (updateError) throw updateError

        // Record in quote negotiations history
        await supabaseAdmin
            .from('quote_negotiations')
            .insert({
                booking_id,
                quoted_by: 'provider',
                quoted_price: booking.user_quoted_price,
                message: 'Provider accepted user quote',
                status: 'confirmed'
            })

        // Notify user
        await supabaseAdmin
            .from('notifications')
            .insert({
                user_id: booking.user_id,
                title: 'Quote Accepted',
                message: `Provider accepted your quote of ₹${booking.user_quoted_price}`,
                type: 'booking',
                reference_id: booking_id
            })

        return res.status(200).json({
            success: true,
            message: 'Quote accepted successfully',
            final_price: booking.user_quoted_price
        })
    } catch (error) {
        console.error('Accept quote error:', error)
        return res.status(500).json({ error: error.message })
    }
}
