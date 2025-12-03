import { supabaseAdmin } from '../../../../lib/supabase'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { booking_id, reason } = req.body

        if (!booking_id || !reason) {
            return res.status(400).json({ error: 'Booking ID and reason are required' })
        }

        // Get auth token
        const authHeader = req.headers.authorization
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' })
        }
        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        // 1. Fetch booking to verify it exists and has a provider
        const { data: booking, error: bookingError } = await supabaseAdmin
            .from('bookings')
            .select('*, provider:providers!bookings_provider_id_fkey(*)')
            .eq('id', booking_id)
            .single()

        if (bookingError || !booking) {
            return res.status(404).json({ error: 'Booking not found' })
        }

        if (!booking.provider_id) {
            return res.status(400).json({ error: 'Booking is not assigned to any provider' })
        }

        // Verify ownership
        if (booking.provider?.user_id !== user.id) {
            return res.status(403).json({ error: 'You are not authorized to release this booking' })
        }

        // 2. Update booking: Reset to pending, remove provider, append reason
        const newNotes = booking.notes
            ? `${booking.notes}\n[Provider Cancelled]: ${reason}`
            : `[Provider Cancelled]: ${reason}`

        const { data: updatedBooking, error: updateError } = await supabaseAdmin
            .from('bookings')
            .update({
                status: 'pending',
                provider_id: null,
                notes: newNotes,
                updated_at: new Date().toISOString()
            })
            .eq('id', booking_id)
            .select()
            .single()

        if (updateError) throw updateError

        // 3. Log to history (optional)
        try {
            await supabaseAdmin
                .from('booking_status_history')
                .insert({
                    booking_id: booking_id,
                    status: 'pending',
                    changed_by: booking.provider?.user_id,
                    notes: `Released by provider. Reason: ${reason}`
                })
        } catch (e) {
            console.warn('Failed to log history:', e.message)
        }

        // 4. Notify User
        if (booking.user_id) {
            await supabaseAdmin
                .from('notifications')
                .insert({
                    user_id: booking.user_id,
                    title: 'Booking Update',
                    message: `The provider has cancelled your booking. It is now available for other providers to accept.`,
                    type: 'booking',
                    reference_id: booking.id
                })
        }

        return res.status(200).json({ success: true, booking: updatedBooking })

    } catch (error) {
        console.error('Release booking error:', error)
        return res.status(500).json({ error: error.message })
    }
}
