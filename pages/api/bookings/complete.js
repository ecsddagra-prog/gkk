import { supabaseAdmin } from '../../../lib/supabase'
import { sendNotification } from '../../../lib/notifications'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase admin client not configured' })
  }

  try {
    const { booking_id, completed_by } = req.body

    if (!booking_id || !completed_by) {
      return res.status(400).json({ error: 'Booking ID and completed_by are required' })
    }

    // Get booking
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select('*, provider:providers!bookings_provider_id_fkey(*)')
      .eq('id', booking_id)
      .single()

    if (bookingError || !booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    // Verify who is completing
    const isProvider = booking.provider?.user_id === completed_by
    const isUser = booking.user_id === completed_by

    if (!isProvider && !isUser) {
      return res.status(403).json({ error: 'Unauthorized to complete this booking' })
    }

    // Update booking status
    await supabaseAdmin
      .from('bookings')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', booking_id)

    // Record status history
    try {
      await supabaseAdmin
        .from('booking_status_history')
        .insert({
          booking_id: booking_id,
          status: 'completed',
          changed_by: completed_by
        })
    } catch (e) {
      console.warn('Failed to record history:', e)
    }

    // Update provider stats
    if (isProvider && booking.provider_id) {
      await supabaseAdmin
        .from('providers')
        .update({
          total_jobs_completed: (booking.provider.total_jobs_completed || 0) + 1
        })
        .eq('id', booking.provider_id)
    }

    // Notify user
    await sendNotification({
      userId: booking.user_id,
      title: 'Booking Completed',
      message: `Your booking #${booking.booking_number} has been completed. Please rate your experience.`,
      type: 'booking',
      referenceId: booking_id
    })

    // Notify provider
    if (booking.provider?.user_id) {
      await sendNotification({
        userId: booking.provider.user_id,
        title: 'Booking Completed',
        message: `You have successfully completed booking #${booking.booking_number}.`,
        type: 'booking',
        referenceId: booking_id
      })
    }

    return res.status(200).json({
      message: 'Booking completed successfully',
      booking_id
    })
  } catch (error) {
    console.error('Complete booking error:', error)
    return res.status(500).json({ error: error.message })
  }
}

