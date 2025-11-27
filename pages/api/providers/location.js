import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase admin client not configured' })
  }

  try {
    const { provider_id, latitude, longitude } = req.body

    if (!provider_id || !latitude || !longitude) {
      return res.status(400).json({ error: 'Provider ID and location are required' })
    }

    // Update provider location
    const { data: provider, error } = await supabaseAdmin
      .from('providers')
      .update({
        current_lat: latitude,
        current_lng: longitude,
        last_location_update: new Date().toISOString(),
        is_online: true
      })
      .eq('id', provider_id)
      .select()
      .single()

    if (error) throw error

    return res.status(200).json({ provider })
  } catch (error) {
    console.error('Update location error:', error)
    return res.status(500).json({ error: error.message })
  }
}

