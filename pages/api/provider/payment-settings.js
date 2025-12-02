import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
    if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase admin client not configured' })
    }

    try {
        // Get provider_id from session/user
        const authHeader = req.headers.authorization
        if (!authHeader) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        // Get provider
        const { data: provider, error: providerError } = await supabaseAdmin
            .from('providers')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (providerError || !provider) {
            return res.status(404).json({ error: 'Provider not found' })
        }

        if (req.method === 'GET') {
            // Fetch payment settings
            const { data: settings, error } = await supabaseAdmin
                .from('provider_payment_settings')
                .select('*')
                .eq('provider_id', provider.id)
                .single()

            if (error && error.code !== 'PGRST116') {
                throw error
            }

            return res.status(200).json({ settings: settings || null })
        }

        if (req.method === 'POST' || req.method === 'PUT') {
            const {
                account_holder_name,
                bank_name,
                account_number,
                ifsc_code,
                upi_id,
                qr_code_url,
                primary_method
            } = req.body

            // Validation
            if (primary_method && !['bank', 'upi', 'cash', 'all'].includes(primary_method)) {
                return res.status(400).json({ error: 'Invalid primary_method' })
            }

            // Check if settings exist
            const { data: existing } = await supabaseAdmin
                .from('provider_payment_settings')
                .select('id')
                .eq('provider_id', provider.id)
                .single()

            const settingsData = {
                provider_id: provider.id,
                account_holder_name,
                bank_name,
                account_number,
                ifsc_code,
                upi_id,
                qr_code_url,
                primary_method
            }

            let result

            if (existing) {
                // Update existing
                const { data, error } = await supabaseAdmin
                    .from('provider_payment_settings')
                    .update(settingsData)
                    .eq('provider_id', provider.id)
                    .select()
                    .single()

                if (error) throw error
                result = data
            } else {
                // Create new
                const { data, error } = await supabaseAdmin
                    .from('provider_payment_settings')
                    .insert(settingsData)
                    .select()
                    .single()

                if (error) throw error
                result = data
            }

            return res.status(200).json({ settings: result })
        }

        return res.status(405).json({ error: 'Method not allowed' })
    } catch (error) {
        console.error('Payment settings error:', error)
        return res.status(500).json({ error: error.message })
    }
}
