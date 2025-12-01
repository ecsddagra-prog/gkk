import { supabaseAdmin } from '../../lib/supabase'

export default async function handler(req, res) {
    if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase admin client not configured' })
    }

    if (req.method === 'GET') {
        try {
            const { service_id } = req.query

            let query = supabaseAdmin
                .from('subscriptions')
                .select(`
          *,
          provider:providers (
            business_name,
            city
          ),
          service:services (
            name
          )
        `)
                .eq('active', true)
                .order('created_at', { ascending: false })

            if (service_id) {
                query = query.eq('service_id', service_id)
            }

            const { data, error } = await query

            if (error) throw error

            return res.status(200).json({ subscriptions: data })
        } catch (error) {
            console.error('Public subscriptions error:', error)
            return res.status(500).json({ error: 'Failed to fetch subscriptions' })
        }
    }

    return res.status(405).json({ error: 'Method not allowed' })
}
