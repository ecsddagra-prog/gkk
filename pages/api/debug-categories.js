import { supabaseAdmin } from '../../lib/supabase'

export default async function handler(req, res) {
    try {
        const { data, error } = await supabaseAdmin
            .from('service_categories')
            .select('*')

        if (error) throw error

        return res.status(200).json({
            count: data?.length || 0,
            categories: data
        })
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}
