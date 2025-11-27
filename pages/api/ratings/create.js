import { supabaseAdmin } from '../../../lib/supabase'
import { checkLowRating } from '../../../lib/utils'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase admin client not configured' })
  }

  try {
    const { booking_id, user_id, rating, review_text, review_photos } = req.body

    if (!booking_id || !user_id || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Invalid rating data' })
    }

    // Check if booking exists and belongs to user
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select('*, provider:providers(*)')
      .eq('id', booking_id)
      .eq('user_id', user_id)
      .eq('status', 'completed')
      .single()

    if (bookingError || !booking) {
      return res.status(404).json({ error: 'Booking not found or not completed' })
    }

    // Check if rating already exists
    const { data: existingRating } = await supabaseAdmin
      .from('ratings')
      .select('*')
      .eq('booking_id', booking_id)
      .single()

    if (existingRating) {
      return res.status(400).json({ error: 'Rating already exists for this booking' })
    }

    // Create rating
    const { data: ratingData, error: ratingError } = await supabaseAdmin
      .from('ratings')
      .insert({
        booking_id,
        user_id,
        provider_id: booking.provider_id,
        rating,
        review_text,
        review_photos: review_photos || []
      })
      .select()
      .single()

    if (ratingError) throw ratingError

    // Check for low ratings and suspend if needed
    if (booking.provider_id) {
      const { data: allRatings } = await supabaseAdmin
        .from('ratings')
        .select('rating')
        .eq('provider_id', booking.provider_id)
        .order('created_at', { ascending: false })
        .limit(3)

      if (allRatings && allRatings.length >= 3) {
        const shouldSuspend = checkLowRating(allRatings)

        if (shouldSuspend) {
          const { data: settings } = await supabaseAdmin
            .from('admin_settings')
            .select('value')
            .eq('key', 'suspension_days')
            .single()

          const suspensionDays = settings?.value?.value || 7
          const suspensionUntil = new Date()
          suspensionUntil.setDate(suspensionUntil.getDate() + suspensionDays)

          await supabaseAdmin
            .from('providers')
            .update({
              is_suspended: true,
              suspension_until: suspensionUntil
            })
            .eq('id', booking.provider_id)

          // Notify provider
          const { data: provider } = await supabaseAdmin
            .from('providers')
            .select('user_id')
            .eq('id', booking.provider_id)
            .single()

          if (provider) {
            await supabaseAdmin
              .from('notifications')
              .insert({
                user_id: provider.user_id,
                title: 'Account Suspended',
                message: `Your account has been suspended for ${suspensionDays} days due to low ratings`,
                type: 'account',
                reference_id: booking.provider_id
              })
          }
        }
      }
    }

    return res.status(201).json({ rating: ratingData })
  } catch (error) {
    console.error('Create rating error:', error)
    return res.status(500).json({ error: error.message })
  }
}

