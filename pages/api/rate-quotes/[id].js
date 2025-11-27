import { supabaseAdmin } from '../../../lib/supabase'
import { requireAuthUser } from '../../../lib/api-auth'

async function getProviderId(userId) {
  const { data } = await supabaseAdmin
    .from('providers')
    .select('id')
    .eq('user_id', userId)
    .single()

  return data?.id || null
}

export default async function handler(req, res) {
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase admin client not configured' })
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query
  if (!id) {
    return res.status(400).json({ error: 'Rate quote ID missing' })
  }

  try {
    const user = await requireAuthUser(req)
    const providerId = await getProviderId(user.id)

    const { data: rateQuote, error } = await supabaseAdmin
      .from('rate_quotes')
      .select(`
        *,
        service:services(*),
        sub_service:service_subservices(*),
        provider_quotes(
          *,
          provider:providers(
            id,
            business_name,
            user:users(full_name, phone)
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error || !rateQuote) {
      return res.status(404).json({ error: 'Rate quote not found' })
    }

    const isOwner = rateQuote.user_id === user.id
    const providerQuote = rateQuote.provider_quotes?.find(q => q.provider_id === providerId)

    if (!isOwner && !providerQuote) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    return res.status(200).json({ rate_quote: rateQuote })
  } catch (error) {
    console.error('Rate quote fetch error:', error)
    const status = error.status || 500
    return res.status(status).json({ error: error.message })
  }
}

