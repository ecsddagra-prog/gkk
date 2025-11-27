import { supabaseAdmin } from '../../../lib/supabase'
import { calculateCashback, calculateRewards } from '../../../lib/utils'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase admin client not configured' })
  }

  try {
    const { booking_id, quote_id, accepted_by } = req.body

    if (!booking_id || !quote_id || !accepted_by) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Get quote
    const { data: quote, error: quoteError } = await supabaseAdmin
      .from('booking_quotes')
      .select('*')
      .eq('id', quote_id)
      .eq('booking_id', booking_id)
      .single()

    if (quoteError || !quote) {
      return res.status(404).json({ error: 'Quote not found' })
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

    // Mark quote as accepted
    await supabaseAdmin
      .from('booking_quotes')
      .update({ is_accepted: true })
      .eq('id', quote_id)

    // Update booking with final price and status
    const finalPrice = quote.quoted_price
    const { data: settings } = await supabaseAdmin
      .from('admin_settings')
      .select('value')
      .eq('key', 'cashback_percentage')
      .single()

    const cashbackPercentage = settings?.value?.value || 5
    const cashbackAmount = calculateCashback(finalPrice, cashbackPercentage)
    const rewardsAmount = calculateRewards(finalPrice)

    await supabaseAdmin
      .from('bookings')
      .update({
        status: 'confirmed',
        final_price: finalPrice,
        cashback_earned: cashbackAmount,
        rewards_earned: rewardsAmount
      })
      .eq('id', booking_id)

    // Notify both parties
    const { data: provider } = await supabaseAdmin
      .from('providers')
      .select('user_id')
      .eq('id', booking.provider_id)
      .single()

    // Notify user
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: booking.user_id,
        title: 'Booking Confirmed',
        message: `Your booking for ${booking.service?.name} has been confirmed at ₹${finalPrice}`,
        type: 'booking',
        reference_id: booking_id
      })

    // Notify provider
    if (provider) {
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: provider.user_id,
          title: 'Booking Confirmed',
          message: `Booking #${booking.booking_number} has been confirmed`,
          type: 'booking',
          reference_id: booking_id
        })
    }

    return res.status(200).json({ 
      message: 'Quote accepted successfully',
      booking_id,
      final_price: finalPrice
    })
  } catch (error) {
    console.error('Accept quote error:', error)
    return res.status(500).json({ error: error.message })
  }
}

