import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase admin client not configured' })
    }

    try {
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

        const {
            old_document_id,
            new_document_url,
            new_document_number,
            change_reason
        } = req.body

        // Validation
        if (!old_document_id || !new_document_url || !change_reason) {
            return res.status(400).json({ error: 'Missing required fields' })
        }

        // Get old document and verify it belongs to this provider and is verified
        const { data: oldDoc, error: oldDocError } = await supabaseAdmin
            .from('provider_documents')
            .select('*')
            .eq('id', old_document_id)
            .eq('provider_id', provider.id)
            .single()

        if (oldDocError || !oldDoc) {
            return res.status(404).json({ error: 'Document not found' })
        }

        if (oldDoc.status !== 'verified') {
            return res.status(400).json({ error: 'Can only request changes for verified documents' })
        }

        // Check if there's already a pending request for this document
        const { data: existingRequest } = await supabaseAdmin
            .from('provider_document_change_requests')
            .select('id')
            .eq('old_document_id', old_document_id)
            .eq('status', 'pending')
            .single()

        if (existingRequest) {
            return res.status(400).json({ error: 'A change request is already pending for this document' })
        }

        // Create change request
        const { data: request, error: requestError } = await supabaseAdmin
            .from('provider_document_change_requests')
            .insert({
                provider_id: provider.id,
                old_document_id,
                document_type: oldDoc.document_type,
                new_document_url,
                new_document_number,
                change_reason
            })
            .select()
            .single()

        if (requestError) throw requestError

        // TODO: Send notification to admin

        return res.status(201).json({
            message: 'Change request submitted successfully',
            request
        })
    } catch (error) {
        console.error('Document change request error:', error)
        return res.status(500).json({ error: error.message })
    }
}
