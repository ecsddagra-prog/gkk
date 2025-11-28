import { supabaseAdmin } from '../../../lib/supabase'
import { requireAuthUser } from '../../../lib/api-auth'

export default async function handler(req, res) {
    if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase admin client not configured' })
    }

    try {
        const user = await requireAuthUser(req)

        // Get provider profile
        const { data: provider, error: providerError } = await supabaseAdmin
            .from('providers')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (providerError || !provider) {
            return res.status(404).json({ error: 'Provider profile not found' })
        }

        if (req.method === 'POST') {
            const { sub_service_id, rate } = req.body

            if (!sub_service_id || rate === undefined) {
                return res.status(400).json({ error: 'sub_service_id and rate are required' })
            }

            // Upsert rate
            const { data, error } = await supabaseAdmin
                .from('provider_service_rates')
                .upsert({
                    provider_id: provider.id,
                    sub_service_id,
                    rate: Number(rate),
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'provider_id, sub_service_id'
                })
                .select()
                .single()

            if (error) throw error

            return res.status(200).json({ rate: data })
        }

        return res.status(405).json({ error: 'Method not allowed' })
    } catch (error) {
        console.error('Provider rate error:', error)
        const status = error.status || 500
        return res.status(status).json({ error: error.message })
    }
}
