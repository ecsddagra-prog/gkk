import { supabaseAdmin } from '../../../../lib/supabase'
import { requireAdminUser } from '../../../../lib/api-auth'

export default async function handler(req, res) {
    try {
        await requireAdminUser(req)
        const { id } = req.query

        if (req.method === 'GET') {
            // Fetch provider details with user info
            // Fetch provider details with user info
            const { data: provider, error: providerError } = await supabaseAdmin
                .from('providers')
                .select(`
                    *,
                    user:users (
                        id,
                        full_name,
                        email,
                        phone,
                        role
                    )
                `)
                .eq('id', id)
                .single()

            if (providerError) throw providerError

            // Fetch provider documents
            const { data: documents, error: docsError } = await supabaseAdmin
                .from('provider_documents')
                .select('*')
                .eq('provider_id', id)
                .order('created_at', { ascending: false })

            if (docsError) throw docsError

            return res.status(200).json({
                provider,
                documents: documents || []
            })
        }

        if (req.method === 'PUT') {
            const { action, documentId, status, rejectionReason } = req.body

            // Update Provider Status
            if (action === 'update_status') {
                const { is_verified, is_suspended } = req.body
                const updates = {}
                if (typeof is_verified !== 'undefined') updates.is_verified = is_verified
                if (typeof is_suspended !== 'undefined') updates.is_suspended = is_suspended

                const { error } = await supabaseAdmin
                    .from('providers')
                    .update(updates)
                    .eq('id', id)

                if (error) throw error
                return res.status(200).json({ success: true })
            }

            // Update Document Status
            if (action === 'update_document') {
                if (!documentId || !status) {
                    return res.status(400).json({ error: 'Missing documentId or status' })
                }

                const { error } = await supabaseAdmin
                    .from('provider_documents')
                    .update({
                        status,
                        rejection_reason: status === 'rejected' ? rejectionReason : null,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', documentId)
                    .eq('provider_id', id)

                if (error) throw error
                return res.status(200).json({ success: true })
            }
        }

        res.setHeader('Allow', ['GET', 'PUT'])
        res.status(405).end(`Method ${req.method} Not Allowed`)

    } catch (error) {
        console.error('Provider details API error:', error)
        res.status(error.status || 500).json({ error: error.message })
    }
}
