import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { id } = req.query
    if (!id) {
        return res.status(400).json({ error: 'ID is required' })
    }

    try {
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
            .eq('id', id)
            .single()

        if (error) throw error

        return res.status(200).json({ service: data })
    } catch (error) {
        console.error('Service details error:', error)
        return res.status(500).json({ error: error.message })
    }
}
