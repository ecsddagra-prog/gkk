import { supabaseAdmin } from '../../../lib/supabase'
import { requireAuthUser } from '../../../lib/api-auth'

const DEFAULT_COUNTDOWN_MINUTES = 10

export default async function handler(req, res) {
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase admin client not configured' })
  }

  try {
    const user = await requireAuthUser(req)

    if (req.method === 'GET') {
      const { data, error } = await supabaseAdmin
        .from('rate_quotes')
        .select('*, provider_quotes(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return res.status(200).json({ rate_quotes: data || [] })
    }

    if (req.method === 'POST') {
      const {
        service_id,
        sub_service_id,
        city_id,
        address_id,
        requested_price,
        details
      } = req.body || {}

      if (!service_id || !city_id) {
        return res.status(400).json({ error: 'service_id and city_id are required' })
      }

      let durationMinutes = 30 // Default fallback

      if (details?.waiting_time_flexibility) {
        switch (details.waiting_time_flexibility) {
          case 'Exact Time':
            durationMinutes = 15 // Strict: 15 mins auction
            break
          case '+/- 30 Minutes':
            durationMinutes = 30
            break
          case '+/- 1 Hour':
            durationMinutes = 60
            break
          case '+/- 2 Hours':
            durationMinutes = 120
            break
          case '+/- 4 Hours':
            durationMinutes = 240
            break
          case 'Same Day (Anytime)':
            durationMinutes = 720 // 12 Hours
            break
          case 'Flexible (This Week)':
            durationMinutes = 2880 // 48 Hours
            break
        }
      }

      const countdownMinutes = Number(details?.countdown_minutes) || durationMinutes
      const expiresAt = new Date(Date.now() + countdownMinutes * 60 * 1000).toISOString()

      const { data: rateQuote, error } = await supabaseAdmin
        .from('rate_quotes')
        .insert({
          user_id: user.id,
          service_id,
          sub_service_id: sub_service_id || null,
          city_id,
          address_id: address_id || null, // Make optional
          requested_price: requested_price || null,
          details: details || null,
          expires_at: expiresAt
        })
        .select()
        .single()

      if (error) throw error

      // Broadcast notification to available providers of this service
      const { data: providerServices } = await supabaseAdmin
        .from('provider_services')
        .select('provider_id, provider:providers(user_id, is_verified, is_suspended, is_available)')
        .eq('service_id', service_id)
        .eq('is_active', true)

      const targetProviders = (providerServices || [])
        .map(item => item.provider)
        .filter(provider => provider && provider.is_verified && !provider.is_suspended && provider.is_available)

      if (targetProviders.length > 0) {
        await supabaseAdmin
          .from('notifications')
          .insert(targetProviders.map(provider => ({
            user_id: provider.user_id,
            title: 'New rate quote request',
            message: 'A user requested a rate quote for your service. Respond quickly to win the booking.',
            type: 'rate_quote',
            reference_id: rateQuote.id
          })))
      }

      return res.status(201).json({ rate_quote: rateQuote })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Rate quotes API error:', error)
    const status = error.status || 500
    return res.status(status).json({ error: error.message })
  }
}

