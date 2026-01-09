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

        let query = supabaseAdmin
            .from('city_services')
            .select(`
                service:services(
                    *,
                    category:service_categories(*)
                )
            `)
            .eq('is_enabled', true)

        if (city_id) {
            query = query.eq('city_id', city_id)
        }

        const { data, error } = await query

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
