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

      if (!service_id || !city_id || !address_id) {
        return res.status(400).json({ error: 'service_id, city_id and address_id are required' })
      }

      const countdownMinutes = Number(details?.countdown_minutes) || DEFAULT_COUNTDOWN_MINUTES
      const expiresAt = new Date(Date.now() + countdownMinutes * 60 * 1000).toISOString()

      const { data: rateQuote, error } = await supabaseAdmin
        .from('rate_quotes')
        .insert({
          user_id: user.id,
          service_id,
          sub_service_id: sub_service_id || null,
          city_id,
          address_id,
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

