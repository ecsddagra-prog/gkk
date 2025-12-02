import { supabaseAdmin } from '../../../../lib/supabase'

export default async function handler(req, res) {
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

        // Check if user is admin
        const { data: userData } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!userData || (userData.role !== 'admin' && userData.role !== 'superadmin')) {
            return res.status(403).json({ error: 'Forbidden - Admin access required' })
        }

        if (req.method === 'GET') {
            // Get all pending change requests
            const { data: requests, error } = await supabaseAdmin
                .from('provider_document_change_requests')
                .select(`
          *,
          provider:providers(
            id,
            business_name,
            user:users(full_name, email)
          ),
          old_document:provider_documents(
            document_type,
            document_number,
            document_url
          )
        `)
                .eq('status', 'pending')
                .order('created_at', { ascending: false })

            if (error) throw error

            return res.status(200).json({ requests: requests || [] })
        }

        if (req.method === 'PATCH') {
            const { id } = req.query
            const { action, rejection_reason } = req.body

            if (!id || !action) {
                return res.status(400).json({ error: 'Missing required fields' })
            }

            if (!['approve', 'reject'].includes(action)) {
                return res.status(400).json({ error: 'Invalid action' })
            }

            // Get the change request
            const { data: request, error: requestError } = await supabaseAdmin
                .from('provider_document_change_requests')
                .select('*')
                .eq('id', id)
                .single()

            if (requestError || !request) {
                return res.status(404).json({ error: 'Change request not found' })
            }

            if (action === 'approve') {
                // Update the old document with new data
                const { error: updateError } = await supabaseAdmin
                    .from('provider_documents')
                    .update({
                        document_url: request.new_document_url,
                        document_number: request.new_document_number,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', request.old_document_id)

                if (updateError) throw updateError

                // Mark request as approved
                await supabaseAdmin
                    .from('provider_document_change_requests')
                    .update({
                        status: 'approved',
                        reviewed_by: user.id,
                        reviewed_at: new Date().toISOString()
                    })
                    .eq('id', id)

                // Recalculate provider verification status
                await recalculateProviderVerification(request.provider_id)

                return res.status(200).json({
                    message: 'Change request approved',
                    action: 'approved'
                })
            }

            if (action === 'reject') {
                if (!rejection_reason) {
                    return res.status(400).json({ error: 'Rejection reason is required' })
                }

                // Mark request as rejected
                await supabaseAdmin
                    .from('provider_document_change_requests')
                    .update({
                        status: 'rejected',
                        rejection_reason,
                        reviewed_by: user.id,
                        reviewed_at: new Date().toISOString()
                    })
                    .eq('id', id)

                return res.status(200).json({
                    message: 'Change request rejected',
                    action: 'rejected'
                })
            }
        }

        return res.status(405).json({ error: 'Method not allowed' })
    } catch (error) {
        console.error('Document change request admin error:', error)
        return res.status(500).json({ error: error.message })
    }
}

// Helper function to recalculate provider verification status
async function recalculateProviderVerification(providerId) {
    const { data: documents } = await supabaseAdmin
        .from('provider_documents')
        .select('document_type, status')
        .eq('provider_id', providerId)

    if (!documents || documents.length === 0) {
        await supabaseAdmin
            .from('providers')
            .update({ verification_status: 'pending' })
            .eq('id', providerId)
        return
    }

    const required = ['aadhar', 'pan', 'license']
    const verified = documents.filter(d => d.status === 'verified')
    const rejected = documents.filter(d => d.status === 'rejected')

    const verifiedTypes = verified.map(d => d.document_type)
    const allRequiredVerified = required.every(type => verifiedTypes.includes(type))

    let status = 'pending'
    if (allRequiredVerified) {
        status = 'verified'
    } else if (rejected.length > 0) {
        status = 'rejected'
    } else if (verified.length > 0) {
        status = 'partially_verified'
    }

    await supabaseAdmin
        .from('providers')
        .update({ verification_status: status })
        .eq('id', providerId)
}
