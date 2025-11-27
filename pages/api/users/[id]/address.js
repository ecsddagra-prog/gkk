import { supabaseAdmin } from '../../../../lib/supabase'
import { requireAuthUser } from '../../../../lib/api-auth'

function normalizeAddressPayload(body = {}) {
  return {
    address_type: body.address_type || 'home',
    address_line1: body.address_line1?.trim(),
    address_line2: body.address_line2?.trim() || null,
    city: body.city?.trim(),
    state: body.state?.trim() || null,
    pincode: body.pincode?.trim() || null,
    latitude: body.latitude !== undefined && body.latitude !== '' ? Number(body.latitude) : null,
    longitude: body.longitude !== undefined && body.longitude !== '' ? Number(body.longitude) : null,
    is_default: Boolean(body.is_default)
  }
}

export default async function handler(req, res) {
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase admin client not configured' })
  }

  const { id: userId } = req.query
  if (!userId) {
    return res.status(400).json({ error: 'User ID missing in path' })
  }

  try {
    const authUser = await requireAuthUser(req)
    if (authUser.id !== userId) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    if (req.method === 'GET') {
      const { data, error } = await supabaseAdmin
        .from('user_addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      return res.status(200).json({ addresses: data || [] })
    }

    if (req.method === 'POST') {
      const payload = normalizeAddressPayload(req.body)

      if (!payload.address_line1 || !payload.city) {
        return res.status(400).json({ error: 'address_line1 and city are required' })
      }

      if (payload.is_default) {
        await supabaseAdmin
          .from('user_addresses')
          .update({ is_default: false })
          .eq('user_id', userId)
      }

      const { data: address, error } = await supabaseAdmin
        .from('user_addresses')
        .insert({ ...payload, user_id: userId })
        .select()
        .single()

      if (error) throw error
      return res.status(201).json({ address })
    }

    if (req.method === 'PUT') {
      const { address_id } = req.body || {}
      if (!address_id) {
        return res.status(400).json({ error: 'address_id is required for update' })
      }

      const payload = normalizeAddressPayload(req.body)
      if (!payload.address_line1 || !payload.city) {
        return res.status(400).json({ error: 'address_line1 and city are required' })
      }

      if (payload.is_default) {
        await supabaseAdmin
          .from('user_addresses')
          .update({ is_default: false })
          .eq('user_id', userId)
          .neq('id', address_id)
      }

      const { data: address, error } = await supabaseAdmin
        .from('user_addresses')
        .update(payload)
        .eq('id', address_id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return res.status(200).json({ address })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('User address API error:', error)
    const status = error.status || 500
    return res.status(status).json({ error: error.message })
  }
}

