import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase admin client not configured' })
    }

    try {
        const { category_id } = req.query

        if (!category_id) {
            return res.status(400).json({ error: 'category_id is required' })
        }

        const { data, error } = await supabaseAdmin
            .from('services')
            .select('*')
            .eq('category_id', category_id)
            .eq('is_active', true)
            .order('name')

        if (error) throw error

        return res.status(200).json({ services: data || [] })
    } catch (error) {
        console.error('Catalog services error:', error)
        return res.status(500).json({ error: error.message })
    }
}
