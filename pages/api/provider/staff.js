import { supabaseAdmin } from '../../../lib/supabase'
import { requireProviderUser } from '../../../lib/api-auth'

export default async function handler(req, res) {
    try {
        const { provider } = await requireProviderUser(req)

        if (req.method === 'GET') {
            const { data: staff, error } = await supabaseAdmin
                .from('provider_staff')
                .select('*')
                .eq('provider_id', provider.id)
                .order('created_at', { ascending: false })

            if (error) throw error

            return res.status(200).json({ staff })
        }

        if (req.method === 'POST') {
            const { full_name, phone, role, id_proof_url } = req.body

            if (!full_name || !phone) {
                return res.status(400).json({ error: 'Name and phone are required' })
            }

            const { data, error } = await supabaseAdmin
                .from('provider_staff')
                .insert({
                    provider_id: provider.id,
                    full_name,
                    phone,
                    role,
                    id_proof_url,
                    is_active: true
                })
                .select()
                .single()

            if (error) throw error

            return res.status(200).json({ success: true, item: data })
        }

        if (req.method === 'PUT') {
            const { id, full_name, phone, role, id_proof_url, is_active } = req.body

            if (!id) {
                return res.status(400).json({ error: 'ID is required' })
            }

            const { error } = await supabaseAdmin
                .from('provider_staff')
                .update({
                    full_name,
                    phone,
                    role,
                    id_proof_url,
                    is_active,
                    updated_at: new Date()
                })
                .eq('id', id)
                .eq('provider_id', provider.id)

            if (error) throw error

            return res.status(200).json({ success: true })
        }

        if (req.method === 'DELETE') {
            const { id } = req.query

            if (!id) {
                return res.status(400).json({ error: 'ID is required' })
            }

            const { error } = await supabaseAdmin
                .from('provider_staff')
                .delete()
                .eq('id', id)
                .eq('provider_id', provider.id)

            if (error) throw error

            return res.status(200).json({ success: true })
        }

        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        res.status(405).end(`Method ${req.method} Not Allowed`)

    } catch (error) {
        console.error('API Error:', error)
        res.status(error.status || 500).json({ error: error.message })
    }
}
