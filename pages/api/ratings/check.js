import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { user_id, provider_id, rated_by } = req.query

        if (!user_id || !provider_id || !rated_by) {
            return res.status(400).json({ error: 'Missing required parameters' })
        }

        const { data, error } = await supabaseAdmin
            .from('ratings')
            .select('id')
            .eq('user_id', user_id)
            .eq('provider_id', provider_id)
            .eq('rated_by', rated_by)
            .limit(1)
            .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
            throw error
        }

        return res.status(200).json({ hasRated: !!data })
    } catch (error) {
        console.error('Check rating error:', error)
        return res.status(500).json({ error: error.message })
    }
}
