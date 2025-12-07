import { supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
        return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
        const { data, error } = await supabase
            .from('provider_subscribers')
            .select(`
                *,
                provider:providers (
                    id,
                    business_name,
                    business_category_id,
                    city_id,
                    user:users (
                        full_name,
                        profile_picture_url
                    )
                )
            `)
            .eq('user_id', user.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false })

        if (error) throw error

        return res.status(200).json({ subscriptions: data })
    } catch (error) {
        console.error('Fetch subscriptions error:', error)
        return res.status(500).json({ error: 'Failed to fetch subscriptions' })
    }
}
