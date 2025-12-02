import { supabaseAdmin } from '../../../../lib/supabase'

export default async function handler(req, res) {
    if (req.method !== 'PATCH') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { id } = req.query
    const { status, changed_by } = req.body

    if (!id || !status) {
        return res.status(400).json({ error: 'Missing required fields' })
    }

    try {
        // 1. Update booking status
        const { data: booking, error: updateError } = await supabaseAdmin
            .from('bookings')
            .update({ status })
            .eq('id', id)
            .select('*, user:users(*), provider:providers(*)')
            .single()

        if (updateError) throw updateError

        // 2. Record history (optional - won't fail if table doesn't exist)
        try {
            await supabaseAdmin
                .from('booking_status_history')
                .insert({
                    booking_id: id,
                    status,
                    changed_by: changed_by || null
                })
        } catch (historyError) {
            console.warn('Could not record status history:', historyError.message)
        }

        // 3. Send notification to user
        if (booking.user_id) {
            let message = `Your booking status has been updated to ${status}`

            switch (status) {
                case 'accepted':
                    message = 'Your booking has been accepted by the provider!'
                    break
                case 'on_way':
                    message = 'The provider is on the way to your location.'
                    break
                case 'in_progress':
                    message = 'The provider has started the work.'
                    break
                case 'completed':
                    message = 'Your booking is completed! Please rate your experience.'
                    break
                case 'cancelled':
                    message = 'Your booking has been cancelled.'
                    break
            }

            await supabaseAdmin
                .from('notifications')
                .insert({
                    user_id: booking.user_id,
                    title: 'Booking Update',
                    message,
                    type: 'booking',
                    reference_id: id
                })
        }

        return res.status(200).json({ success: true, booking })
    } catch (error) {
        console.error('Error updating status:', error)
        return res.status(500).json({ error: error.message })
    }
}
