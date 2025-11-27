import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase admin client not configured' })
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('service_categories')
            .select('*')
            .eq('is_active', true)
            .order('name')

        if (error) throw error

        return res.status(200).json({ categories: data || [] })
    } catch (error) {
        console.error('Catalog categories error:', error)
        return res.status(500).json({ error: error.message })
    }
}
