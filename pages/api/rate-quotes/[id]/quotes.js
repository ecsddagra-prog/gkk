import { supabaseAdmin } from '../../../../lib/supabase'
import { requireAuthUser } from '../../../../lib/api-auth'

async function getProvider(userId) {
  const { data, error } = await supabaseAdmin
    .from('providers')
    .select('id, is_verified, is_suspended, is_available')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    const err = new Error('Provider profile not found')
    err.status = 404
    throw err
  }

  if (!data.is_verified || data.is_suspended) {
    const err = new Error('Provider is not eligible to quote')
    err.status = 403
    throw err
  }

  return data
}

export default async function handler(req, res) {
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase admin client not configured' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query
  if (!id) {
    return res.status(400).json({ error: 'Rate quote ID missing' })
  }

  try {
    const user = await requireAuthUser(req)
    const provider = await getProvider(user.id)

    const { data: rateQuote, error: rateQuoteError } = await supabaseAdmin
      .from('rate_quotes')
      .select('*')
      .eq('id', id)
      .single()

    if (rateQuoteError || !rateQuote) {
      return res.status(404).json({ error: 'Rate quote not found' })
    }

    if (new Date(rateQuote.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Rate quote has expired' })
    }

    if (!['open', 'matched'].includes(rateQuote.status)) {
      return res.status(400).json({ error: 'Rate quote is no longer accepting bids' })
    }

    const { quoted_price, message } = req.body || {}
    const numericPrice = Number(quoted_price)

    if (!numericPrice || numericPrice <= 0) {
      return res.status(400).json({ error: 'Invalid quoted price' })
    }

    const { data: existingQuote } = await supabaseAdmin
      .from('provider_quotes')
      .select('*')
      .eq('rate_quote_id', id)
      .eq('provider_id', provider.id)
      .maybeSingle()

    let providerQuote

    if (existingQuote) {
      const { data, error } = await supabaseAdmin
        .from('provider_quotes')
        .update({
          quoted_price: numericPrice,
          message: message || null,
          status: 'pending'
        })
        .eq('id', existingQuote.id)
        .select()
        .single()

      if (error) throw error
      providerQuote = data
    } else {
      const { data, error } = await supabaseAdmin
        .from('provider_quotes')
        .insert({
          rate_quote_id: id,
          provider_id: provider.id,
          quoted_price: numericPrice,
          message: message || null
        })
        .select()
        .single()

      if (error) throw error
      providerQuote = data
    }

    await supabaseAdmin
      .from('rate_quotes')
      .update({ status: 'matched' })
      .eq('id', id)

    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: rateQuote.user_id,
        title: 'New quote received',
        message: 'A provider responded to your rate request. Review it before the timer ends.',
        type: 'rate_quote',
        reference_id: id
      })

    return res.status(200).json({ provider_quote: providerQuote })
  } catch (error) {
    console.error('Provider quote submission error:', error)
    const status = error.status || 500
    return res.status(status).json({ error: error.message })
  }
}

