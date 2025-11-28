import { supabaseAdmin } from '../../../../lib/supabase'
import { requireAdminUser } from '../../../../lib/api-auth'

export default async function handler(req, res) {
    if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase admin client not configured' })
    }

    const { id } = req.query
    if (!id) {
        return res.status(400).json({ error: 'Sub-service ID missing' })
    }

    try {
        await requireAdminUser(req)

        if (req.method === 'DELETE') {
            // Try to delete
            const { error } = await supabaseAdmin
                .from('service_subservices')
                .delete()
                .eq('id', id)

            if (error) {
                // Check for foreign key violation (Postgres code 23503)
                if (error.code === '23503') {
                    // Soft delete: Deactivate
                    await supabaseAdmin
                        .from('service_subservices')
                        .update({ is_active: false })
                        .eq('id', id)

                    return res.status(200).json({
                        message: 'Variant has existing bookings/records. It has been deactivated instead of permanently deleted.',
                        soft_deleted: true
                    })
                }
                throw error
            }
            return res.status(200).json({ message: 'Sub-service deleted successfully' })
        }

        if (req.method === 'PATCH') {
            const { is_active } = req.body

            if (is_active === undefined) {
                return res.status(400).json({ error: 'is_active status required' })
            }

            const { data, error } = await supabaseAdmin
                .from('service_subservices')
                .update({ is_active })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return res.status(200).json({ sub_service: data })
        }

        return res.status(405).json({ error: 'Method not allowed' })
    } catch (error) {
        console.error('Sub-service operation error:', error)
        return res.status(500).json({ error: error.message })
    }
}
