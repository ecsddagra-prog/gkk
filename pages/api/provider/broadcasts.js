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

    // Verify user is a provider
    const { data: provider, error: providerError } = await supabase
        .from('providers')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (providerError || !provider) {
        return res.status(403).json({ error: 'Not a provider' })
    }

    try {
        const { data, error } = await supabase
            .from('provider_broadcasts')
            .select('*')
            .eq('provider_id', provider.id)
            .order('created_at', { ascending: false })

        if (error) throw error

        return res.status(200).json({ broadcasts: data })
    } catch (error) {
        console.error('Fetch broadcasts error:', error)
        return res.status(500).json({ error: 'Failed to fetch broadcasts' })
    }
}
