import { supabase, supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    // Get user session
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
        return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Server error: admin client not initialized' })
    }

    if (req.method === 'GET') {
        const { provider_id } = req.query
        if (!provider_id) {
            return res.status(400).json({ error: 'Provider ID is required' })
        }

        try {
            const { data, error } = await supabaseAdmin
                .from('provider_subscribers')
                .select('is_active')
                .eq('user_id', user.id)
                .eq('provider_id', provider_id)
                .single()

            if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
                throw error
            }

            return res.status(200).json({ is_subscribed: data?.is_active || false })
        } catch (error) {
            console.error('Check subscription error:', error)
            return res.status(500).json({ error: 'Failed to verify subscription' })
        }
    }

    if (req.method === 'POST') {
        const { provider_id } = req.body
        if (!provider_id) {
            return res.status(400).json({ error: 'Provider ID is required' })
        }

        try {
            // Check if subscription exists
            const { data: existing } = await supabaseAdmin
                .from('provider_subscribers')
                .select('id, is_active')
                .eq('user_id', user.id)
                .eq('provider_id', provider_id)
                .single()

            let result
            if (existing) {
                // Toggle
                const { data, error } = await supabaseAdmin
                    .from('provider_subscribers')
                    .update({ is_active: !existing.is_active })
                    .eq('id', existing.id)
                    .select()
                    .single()

                if (error) throw error
                result = data
            } else {
                // Create
                const { data, error } = await supabaseAdmin
                    .from('provider_subscribers')
                    .insert({
                        user_id: user.id,
                        provider_id: provider_id,
                        is_active: true
                    })
                    .select()
                    .single()

                if (error) throw error
                result = data
            }

            return res.status(200).json({
                message: result.is_active ? 'Subscribed successfully' : 'Unsubscribed successfully',
                is_subscribed: result.is_active
            })
        } catch (error) {
            console.error('Toggle subscription error:', error)
            return res.status(500).json({ error: error.message })
        }
    }
}
