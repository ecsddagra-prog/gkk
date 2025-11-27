import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase admin client not configured' })
  }

  try {
    const { booking_id, quoted_by, quoted_price, message } = req.body

    if (!booking_id || !quoted_by || !quoted_price) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Get booking
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select('*, service:services(*)')
      .eq('id', booking_id)
      .single()

    if (bookingError || !booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    // Create quote
    const { data: quote, error: quoteError } = await supabaseAdmin
      .from('booking_quotes')
      .insert({
        booking_id,
        quoted_by,
        quoted_price,
        message
      })
      .select()
      .single()

    if (quoteError) throw quoteError

    // Update booking status
    let newStatus = booking.status
    if (quoted_by === 'provider') {
      newStatus = 'quote_sent'
    } else if (quoted_by === 'user') {
      newStatus = 'quote_requested'
    }

    await supabaseAdmin
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', booking_id)

    // Notify the other party
    const notifyUserId = quoted_by === 'user' ? booking.provider_id : booking.user_id
    if (notifyUserId) {
      const { data: provider } = await supabaseAdmin
        .from('providers')
        .select('user_id')
        .eq('id', booking.provider_id)
        .single()

      const targetUserId = quoted_by === 'user' 
        ? provider?.user_id 
        : booking.user_id

      if (targetUserId) {
        await supabaseAdmin
          .from('notifications')
          .insert({
            user_id: targetUserId,
            title: 'New Quote Received',
            message: `A new quote of ₹${quoted_price} has been submitted for ${booking.service?.name}`,
            type: 'booking',
            reference_id: booking_id
          })
      }
    }

    return res.status(201).json({ quote })
  } catch (error) {
    console.error('Quote error:', error)
    return res.status(500).json({ error: error.message })
  }
}

