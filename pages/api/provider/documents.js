import { supabaseAdmin } from '../../../lib/supabase'
import { requireProviderUser } from '../../../lib/api-auth'

export default async function handler(req, res) {
    try {
        const { provider } = await requireProviderUser(req)

        if (req.method === 'GET') {
            const { data: documents, error } = await supabaseAdmin
                .from('provider_documents')
                .select('*')
                .eq('provider_id', provider.id)
                .order('created_at', { ascending: false })

            if (error) throw error

            return res.status(200).json({ documents })
        }

        if (req.method === 'POST') {
            const { document_type, document_number, document_url } = req.body

            if (!document_type || !document_url) {
                return res.status(400).json({ error: 'Type and URL are required' })
            }

            const { data, error } = await supabaseAdmin
                .from('provider_documents')
                .insert({
                    provider_id: provider.id,
                    document_type,
                    document_number,
                    document_url,
                    status: 'pending' // Always pending on upload
                })
                .select()
                .single()

            if (error) throw error

            return res.status(200).json({ success: true, item: data })
        }

        if (req.method === 'DELETE') {
            const { id } = req.query

            if (!id) {
                return res.status(400).json({ error: 'ID is required' })
            }

            // Only allow deleting if not verified (optional rule, but good for safety)
            // Or just allow deleting anything. Let's allow deleting anything for now.
            const { error } = await supabaseAdmin
                .from('provider_documents')
                .delete()
                .eq('id', id)
                .eq('provider_id', provider.id)

            if (error) throw error

            return res.status(200).json({ success: true })
        }

        res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
        res.status(405).end(`Method ${req.method} Not Allowed`)

    } catch (error) {
        console.error('API Error:', error)
        res.status(error.status || 500).json({ error: error.message })
    }
}
