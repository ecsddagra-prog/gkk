import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
    if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase admin client not configured' })
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { city_id } = req.query

        if (!city_id) {
            return res.status(400).json({ error: 'city_id is required' })
        }

        const { data, error } = await supabaseAdmin
            .from('city_services')
            .select(`
        service:services(
          *,
          category:service_categories(*)
        )
      `)
            .eq('city_id', city_id)
            .eq('is_enabled', true)

        if (error) throw error

        const services = (data || []).map(item => item.service).filter(Boolean)

        // Filter active services
        const activeServices = services.filter(s => s.is_active)

        return res.status(200).json({ services: activeServices })
    } catch (error) {
        console.error('Home services fetch error:', error)
        return res.status(500).json({ error: error.message })
    }
}
