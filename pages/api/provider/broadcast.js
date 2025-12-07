import { supabase } from '../../../lib/supabase'

// Rate limit: 5 broadcasts per day
const DAILY_LIMIT = 5

export default async function handler(req, res) {
    if (req.method !== 'POST') {
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
        .select('id, business_name')
        .eq('user_id', user.id)
        .single()

    if (providerError || !provider) {
        return res.status(403).json({ error: 'Not a provider' })
    }

    const { title, message, type, image_url } = req.body

    if (!title || !message || !type) {
        return res.status(400).json({ error: 'Missing required fields' })
    }

    try {
        // 1. Check Rate Limit
        const today = new Date().toISOString().split('T')[0]
        const { count: broadcastsToday, error: limitError } = await supabase
            .from('provider_broadcasts')
            .select('*', { count: 'exact', head: true })
            .eq('provider_id', provider.id)
            .gte('created_at', `${today}T00:00:00.000Z`)
            .lte('created_at', `${today}T23:59:59.999Z`)

        if (limitError) throw limitError

        if (broadcastsToday >= DAILY_LIMIT) {
            return res.status(429).json({ error: `Daily broadcast limit reached (${DAILY_LIMIT}/${DAILY_LIMIT})` })
        }

        // 2. Create Broadcast Record
        const { data: broadcast, error: createError } = await supabase
            .from('provider_broadcasts')
            .insert({
                provider_id: provider.id,
                title,
                message,
                type,
                image_url
            })
            .select()
            .single()

        if (createError) throw createError

        // 3. Get All Subscribers
        const { data: subscribers, error: subError } = await supabase
            .from('provider_subscribers')
            .select('user_id')
            .eq('provider_id', provider.id)
            .eq('is_active', true)

        if (subError) throw subError

        if (subscribers.length === 0) {
            return res.status(200).json({ message: 'Broadcast created but no active subscribers found', broadcast })
        }

        // 4. Create Notifications for Subscribers
        // Using "notifications" table: user_id, title, message, type, reference_id
        const notificationsPool = subscribers.map(sub => ({
            user_id: sub.user_id,
            title: `${provider.business_name}: ${title}`,
            message: message,
            type: 'broadcast',
            reference_id: broadcast.id,
            is_read: false
        }))

        // Insert in batches if needed, but for now assuming reasonable size or Supabase handles it
        const { error: notifyError } = await supabase
            .from('notifications')
            .insert(notificationsPool)

        if (notifyError) throw notifyError

        // 5. Update sent count
        await supabase
            .from('provider_broadcasts')
            .update({ sent_count: subscribers.length })
            .eq('id', broadcast.id)

        return res.status(200).json({
            message: `Broadcast sent to ${subscribers.length} subscribers`,
            broadcast
        })

    } catch (error) {
        console.error('Create broadcast error:', error)
        return res.status(500).json({ error: 'Failed to create broadcast' })
    }
}
