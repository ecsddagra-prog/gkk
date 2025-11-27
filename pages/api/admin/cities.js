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
    
    if (authError) throw authError

    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' })
    }

    if (req.method === 'GET') {
      const { data: cities, error } = await supabaseAdmin
        .from('cities')
        .select('*')
        .order('name')

      if (error) throw error
      return res.status(200).json({ cities })
    }

    if (req.method === 'POST') {
      const { name, state, country = 'India', is_active = false } = req.body

      if (!name) {
        return res.status(400).json({ error: 'City name is required' })
      }

      const { data: city, error } = await supabaseAdmin
        .from('cities')
        .insert({
          name,
          state,
          country,
          is_active
        })
        .select()
        .single()

      if (error) throw error
      return res.status(201).json({ city })
    }

    if (req.method === 'PUT') {
      const { id, ...updates } = req.body

      if (!id) {
        return res.status(400).json({ error: 'City ID is required' })
      }

      const { data: city, error } = await supabaseAdmin
        .from('cities')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return res.status(200).json({ city })
    }

    if (req.method === 'DELETE') {
      const { id } = req.query

      if (!id) {
        return res.status(400).json({ error: 'City ID is required' })
      }

      const { error } = await supabaseAdmin
        .from('cities')
        .delete()
        .eq('id', id)

      if (error) throw error
      return res.status(200).json({ message: 'City deleted successfully' })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Admin cities error:', error)
    return res.status(500).json({ error: error.message })
  }
}

