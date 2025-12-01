import { supabaseAdmin } from '../../../../../lib/supabase'
import { requireAuthUser } from '../../../../../lib/api-auth'

export default async function handler(req, res) {
    if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase admin client not configured' })
    }

    const { id } = req.query

    if (!id) {
        return res.status(400).json({ error: 'Subscription ID is required' })
    }

    try {
        const user = await requireAuthUser(req)

        if (req.method === 'POST') {
            // Verify subscription ownership
            const { data: subscription, error: fetchError } = await supabaseAdmin
                .from('user_subscriptions')
                .select('*')
                .eq('id', id)
                .single()

            if (fetchError || !subscription) {
                return res.status(404).json({ error: 'Subscription not found' })
            }

            if (subscription.user_id !== user.id) {
                return res.status(403).json({ error: 'Forbidden' })
            }

            if (subscription.status === 'canceled') {
                return res.status(400).json({ error: 'Subscription is already canceled' })
            }

            // Cancel subscription
            const { data, error } = await supabaseAdmin
                .from('user_subscriptions')
                .update({
                    status: 'canceled',
                    ends_at: new Date().toISOString() // End immediately or at period end? Immediate for now.
                })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error

            return res.status(200).json({ subscription: data })
        }

        return res.status(405).json({ error: 'Method not allowed' })
    } catch (error) {
        console.error('Subscription cancel error:', error)
        const status = error.status || 500
        return res.status(status).json({ error: error.message })
    }
}
