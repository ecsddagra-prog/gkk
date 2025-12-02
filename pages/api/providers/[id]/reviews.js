import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { id } = req.query

    if (!id) {
        return res.status(400).json({ error: 'Provider ID is required' })
    }

    try {
        const { data: reviews, error } = await supabaseAdmin
            .from('ratings')
            .select(`
        *,
        user:users(full_name, avatar_url)
      `)
            .eq('provider_id', id)
            .order('created_at', { ascending: false })

        if (error) throw error

        return res.status(200).json({ reviews })
    } catch (error) {
        console.error('Error fetching reviews:', error)
        return res.status(500).json({ error: error.message })
    }
}
