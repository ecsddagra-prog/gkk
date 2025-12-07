import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase admin client not configured' })
  }

  // Check admin access
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError) {
      console.error('Auth error:', authError)
      throw authError
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile error:', profileError)
      return res.status(403).json({ error: 'User profile not found' })
    }

    console.log('User role:', profile?.role, 'User ID:', user.id)

    if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
      return res.status(403).json({ error: `Forbidden: Admin access required. Current role: ${profile?.role || 'none'}` })
    }

    if (req.method === 'GET') {
      const { city_id } = req.query

      if (!city_id) {
        return res.status(400).json({ error: 'City ID is required' })
      }

      const { data, error } = await supabaseAdmin
        .from('city_services')
        .select('*, service:services(*, category:service_categories(*))')
        .eq('city_id', city_id)

      if (error) throw error
      return res.status(200).json({ city_services: data })
    }

    if (req.method === 'POST') {
      const { city_id, service_id, is_enabled = true } = req.body

      if (!city_id || !service_id) {
        return res.status(400).json({ error: 'City ID and Service ID are required' })
      }

      // Check if already exists
      const { data: existing } = await supabaseAdmin
        .from('city_services')
        .select('*')
        .eq('city_id', city_id)
        .eq('service_id', service_id)
        .single()

      if (existing) {
        // Update existing
        const { data, error } = await supabaseAdmin
          .from('city_services')
          .update({ is_enabled })
          .eq('id', existing.id)
          .select()
          .single()

        if (error) throw error
        return res.status(200).json({ city_service: data })
      } else {
        // Create new
        const { data, error } = await supabaseAdmin
          .from('city_services')
          .insert({
            city_id,
            service_id,
            is_enabled
          })
          .select()
          .single()

        if (error) throw error
        return res.status(201).json({ city_service: data })
      }
    }

    if (req.method === 'PUT') {
      const { id, is_enabled } = req.body

      if (!id) {
        return res.status(400).json({ error: 'City Service ID is required' })
      }

      const { data, error } = await supabaseAdmin
        .from('city_services')
        .update({ is_enabled })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return res.status(200).json({ city_service: data })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Admin city-services error:', error)
    return res.status(500).json({ error: error.message })
  }
}

