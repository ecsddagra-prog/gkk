import { supabaseAdmin } from '../../../lib/supabase'
import { requireAuthUser } from '../../../lib/api-auth'

export default async function handler(req, res) {
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase admin client not configured' })
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const user = await requireAuthUser(req)

    const [citiesRes, categoriesRes, profileRes, addressesRes] = await Promise.all([
      supabaseAdmin
        .from('cities')
        .select('*')
        .eq('is_active', true)
        .order('name'),
      supabaseAdmin
        .from('service_categories')
        .select('*')
        .eq('is_active', true)
        .order('name'),
      supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single(),
      supabaseAdmin
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })
    ])

    return res.status(200).json({
      cities: citiesRes.data || [],
      categories: categoriesRes.data || [],
      profile: profileRes.data || null,
      addresses: addressesRes.data || []
    })
  } catch (error) {
    console.error('Catalog bootstrap error:', error)
    return res.status(500).json({ error: error.message })
  }
}


