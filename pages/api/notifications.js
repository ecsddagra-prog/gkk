import { requireAuthUser } from '../../lib/api-auth'
import { supabaseAdmin } from '../../lib/supabase'

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase admin client not configured' })
    }

    try {
        const user = await requireAuthUser(req)

        const { data: notifications, error } = await supabaseAdmin
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) throw error

        return res.status(200).json({ notifications })
    } catch (error) {
        console.error('Fetch notifications error:', error)
        const status = error.status || 500
        return res.status(status).json({ error: error.message })
    }
}
