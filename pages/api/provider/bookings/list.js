import { supabaseAdmin } from '../../../../lib/supabase'
import { requireAuthUser } from '../../../../lib/api-auth'

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const user = await requireAuthUser(req)

        const { data: provider, error: providerError } = await supabaseAdmin
            .from('providers')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (providerError || !provider) {
            return res.status(403).json({ error: 'Provider profile not found' })
        }

        const { data: myServices } = await supabaseAdmin
            .from('provider_services')
            .select('service_id')
            .eq('provider_id', provider.id)
            .eq('is_active', true)

        const serviceIds = myServices?.map(s => s.service_id) || []

        let query = supabaseAdmin
            .from('bookings')
            .select('*, service:services(*), user:users(*)')
            .order('created_at', { ascending: false })

        if (serviceIds.length > 0) {
            const orCondition = `provider_id.eq.${provider.id},and(provider_id.is.null,service_id.in.(${serviceIds.join(',')}))`
            query = query.or(orCondition)
        } else {
            query = query.eq('provider_id', provider.id)
        }

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
        const status = error.status || 500
        return res.status(status).json({ error: error.message })
    }
}
