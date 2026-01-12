import { supabaseAdmin } from '../../../../lib/supabase'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { rate_quote_id } = req.body

        // Get authenticated provider
        const token = req.headers.authorization?.split(' ')[1]
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const { data: provider } = await supabaseAdmin
            .from('providers')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (!provider) {
            return res.status(404).json({ error: 'Provider profile not found' })
        }

        // 1. Fetch the rate_quote
        const { data: rateQuote, error: rqError } = await supabaseAdmin
            .from('rate_quotes')
            .select('*')
            .eq('id', rate_quote_id)
            .single()

        if (rqError || !rateQuote) {
            return res.status(404).json({ error: 'Rate quote not found' })
        }

        if (rateQuote.status === 'converted') {
            return res.status(400).json({ error: 'This request has already been booked by another provider.' })
        }

        // 2. Create the booking
        // We map rate_quote fields to booking fields
        const { data: booking, error: bookingError } = await supabaseAdmin
            .from('bookings')
            .insert({
                user_id: rateQuote.user_id,
                service_id: rateQuote.service_id,
                provider_id: provider.id,
                city_id: rateQuote.city_id,
                address_id: rateQuote.address_id,
                service_address: rateQuote.details?.service_address,
                service_lat: rateQuote.details?.service_lat,
                service_lng: rateQuote.details?.service_lng,
                scheduled_date: rateQuote.details?.scheduled_date ? new Date(rateQuote.details.scheduled_date) : null,
                status: 'confirmed', // Immediate confirmation
                base_charge: rateQuote.requested_price, // The user's offer price
                final_price: rateQuote.requested_price,
                sub_service_id: rateQuote.sub_service_id,
                created_at: new Date().toISOString()
            })
            .select()
            .single()

        if (bookingError) {
            throw bookingError
        }

        // 3. Mark rate_quote as converted
        await supabaseAdmin
            .from('rate_quotes')
            .update({ status: 'converted', booking_id: booking.id }) // Assuming booking_id column exists or just status
            .eq('id', rate_quote_id)

        // 4. Create Booking Items (Optional but good practice if logic exists)
        // We skip for now as we might not have all item details easily, or we trust base logic.

        return res.status(200).json({ success: true, booking_id: booking.id })

    } catch (error) {
        console.error('Accept quote error:', error)
        return res.status(500).json({ error: 'Failed to accept offer' })
    }
}
