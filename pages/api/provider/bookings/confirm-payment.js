import { supabaseAdmin } from '../../../../lib/supabase'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { booking_id, payment_method } = req.body

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

        // Let's check if the booking exists and get its provider
        const { data: booking, error: bookingError } = await supabaseAdmin
            .from('bookings')
            .select('*, provider:providers(*)')
            .eq('id', booking_id)
            .single()

        if (bookingError || !booking) {
            return res.status(404).json({ error: 'Booking not found' })
        }

        // Verify ownership
        if (booking.provider?.user_id !== user.id) {
            return res.status(403).json({ error: 'You are not authorized to confirm payment for this booking' })
        }

        // Verify status
        if (booking.status !== 'completed') {
            return res.status(400).json({ error: 'Booking must be completed to confirm payment' })
        }

        // Update payment status
        const { data: updatedBooking, error: updateError } = await supabaseAdmin
            .from('bookings')
            .update({
                payment_status: 'paid',
                payment_method: payment_method || 'cash',
                payment_confirmed_at: new Date().toISOString()
            })
            .eq('id', booking_id)
            .select()
            .single()

        if (updateError) throw updateError

        // Also update the payments table if a record exists, or create one
        // Check for existing payment record
        const { data: existingPayment } = await supabaseAdmin
            .from('payments')
            .select('*')
            .eq('booking_id', booking_id)
            .single()

        if (existingPayment) {
            await supabaseAdmin
                .from('payments')
                .update({
                    payment_status: 'paid',
                    payment_method: payment_method || 'cash',
                    updated_at: new Date().toISOString()
                })
                .eq('id', existingPayment.id)
        } else {
            // Create new payment record
            await supabaseAdmin
                .from('payments')
                .insert({
                    booking_id,
                    user_id: booking.user_id,
                    amount: booking.final_price || booking.base_charge || 0,
                    payment_method: payment_method || 'cash',
                    payment_status: 'paid'
                })
        }

        return res.status(200).json({ success: true, booking: updatedBooking })

    } catch (error) {
        console.error('Payment confirmation error:', error)
        return res.status(500).json({ error: error.message })
    }
}
