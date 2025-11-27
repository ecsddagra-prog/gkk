
import { supabaseAdmin } from '../../../lib/supabase'
import { requireProviderUser } from '../../../lib/api-auth'

export default async function handler(req, res) {
    try {
        const { provider } = await requireProviderUser(req)

        if (req.method === 'GET') {
            const { data: requests, error } = await supabaseAdmin
                .from('service_requests')
                .select('*')
                .eq('provider_id', provider.id)
                .order('created_at', { ascending: false })

            if (error) throw error

            return res.status(200).json({ requests })
        }

        if (req.method === 'POST') {
            const { service_name, category_id, description } = req.body

            if (!service_name) {
                return res.status(400).json({ error: 'Service name is required' })
            }

            const { data: request, error } = await supabaseAdmin
                .from('service_requests')
                .insert({
                    provider_id: provider.id,
                    service_name,
                    category_id: category_id || null,
                    description: description || null,
                    status: 'pending'
                })
                .select()
                .single()

            if (error) throw error

            return res.status(201).json({ request })
        }

        res.setHeader('Allow', ['GET', 'POST'])
        res.status(405).end(`Method ${req.method} Not Allowed`)

    } catch (error) {
        console.error('Service Request API Error:', error)
        res.status(error.status || 500).json({ error: error.message })
    }
}
