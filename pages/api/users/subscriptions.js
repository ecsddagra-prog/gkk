import { supabaseAdmin } from '../../../lib/supabase'
import { requireAuthUser } from '../../../lib/api-auth'

export default async function handler(req, res) {
    if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase admin client not configured' })
    }

    try {
        const user = await requireAuthUser(req)

        if (req.method === 'GET') {
            // List user's subscriptions
            const { data, error } = await supabaseAdmin
                .from('user_subscriptions')
                .select(`
          *,
          subscription:subscriptions (
            title,
            description,
            price,
            interval,
            provider:providers (
              business_name,
              contact_person
            ),
            service:services (
              name
            )
          )
        `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error

            return res.status(200).json({ subscriptions: data })
        }

        if (req.method === 'POST') {
            // Subscribe to an offer
            const { subscription_id } = req.body

            if (!subscription_id) {
                return res.status(400).json({ error: 'subscription_id is required' })
            }

            // Verify subscription exists and is active
            const { data: offer, error: offerError } = await supabaseAdmin
                .from('subscriptions')
                .select('*')
                .eq('id', subscription_id)
                .single()

            if (offerError || !offer) {
                return res.status(404).json({ error: 'Subscription offer not found' })
            }

            if (!offer.active) {
                return res.status(400).json({ error: 'This subscription offer is no longer active' })
            }

            // Check if already subscribed (active)
            const { data: existing } = await supabaseAdmin
                .from('user_subscriptions')
                .select('id')
                .eq('user_id', user.id)
                .eq('subscription_id', subscription_id)
                .in('status', ['active', 'past_due'])
                .single()

            if (existing) {
                return res.status(400).json({ error: 'You are already subscribed to this offer' })
            }

            // Create subscription
            // In a real app, this would handle payment processing here
            const { data, error } = await supabaseAdmin
                .from('user_subscriptions')
                .insert({
                    user_id: user.id,
                    subscription_id: subscription_id,
                    status: 'active',
                    started_at: new Date().toISOString(),
                    // For simplicity, no end date set automatically, or set based on interval
                    // ends_at: ... 
                })
                .select()
                .single()

            if (error) throw error

            return res.status(201).json({ subscription: data })
        }

        return res.status(405).json({ error: 'Method not allowed' })
    } catch (error) {
        console.error('User subscriptions error:', error)
        const status = error.status || 500
        return res.status(status).json({ error: error.message })
    }
}
