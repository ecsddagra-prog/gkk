import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { ids } = req.query
    if (!ids) {
        return res.status(400).json({ error: 'IDs are required' })
    }

    try {
        const idArray = ids.split(',')
        const { data, error } = await supabaseAdmin
            .from('services')
            .select(`
                *,
                category:service_categories(*),
                sub_services:service_subservices(
                    *,
                    sub_subservices:service_sub_subservices(*)
                )
            `)
            .in('id', idArray)
            .eq('is_active', true)

        if (error) throw error

        return res.status(200).json({ services: data || [] })
    } catch (error) {
        console.error('Bulk services error:', error)
        return res.status(500).json({ error: error.message })
    }
}
