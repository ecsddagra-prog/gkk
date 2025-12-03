import { supabaseAdmin } from '../../../../lib/supabase'

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    // Get auth token from header
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
        return res.status(401).json({ error: 'Missing authorization token' })
    }

    try {
        // Verify user
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        // Get provider profile
        const { data: provider, error: providerError } = await supabaseAdmin
            .from('providers')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (providerError || !provider) {
            return res.status(403).json({ error: 'Provider profile not found' })
        }

        // Get provider's active services
        const { data: myServices } = await supabaseAdmin
            .from('provider_services')
            .select('service_id')
            .eq('provider_id', provider.id)
            .eq('is_active', true)

        const serviceIds = myServices?.map(s => s.service_id) || []

        // Build query
        let query = supabaseAdmin
            .from('bookings')
            .select('*, service:services(*), user:users(*)')
            .order('created_at', { ascending: false })

        // Filter logic: Show assigned bookings OR (unassigned AND matching service)
        if (serviceIds.length > 0) {
            // Syntax: provider_id.eq.ID,and(provider_id.is.null,service_id.in.(ID1,ID2))
            const orCondition = `provider_id.eq.${provider.id},and(provider_id.is.null,service_id.in.(${serviceIds.join(',')}))`
            query = query.or(orCondition)
        } else {
            query = query.eq('provider_id', provider.id)
        }

        // Apply status filter if provided
        const { status } = req.query
        if (status && status !== 'all') {
            query = query.eq('status', status)
        }

        const { data: bookings, error: bookingsError } = await query

        if (bookingsError) {
            throw bookingsError
        }

        return res.status(200).json({ bookings })

    } catch (error) {
        console.error('Error fetching provider bookings:', error)
        return res.status(500).json({ error: error.message })
    }
}
