import { supabaseAdmin } from '../../../../lib/supabase'
import { requireAdminUser, requireAuthUser } from '../../../../lib/api-auth'

export default async function handler(req, res) {
    if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase admin client not configured' })
    }

    try {
        console.log('API: /api/admin/units called')
        const authHeader = req.headers.authorization
        console.log('API: Auth Header present:', !!authHeader)

        if (req.method === 'GET') {
            // Allow any authenticated user to view units (Providers need this too for selecting units)
            // Using requireAuthUser instead of requireAdminUser
            await requireAuthUser(req)

            const { data, error } = await supabaseAdmin
                .from('service_units')
                .select('*')
                .eq('is_active', true)
                .order('name', { ascending: true })

            if (error) throw error
            return res.status(200).json({ units: data })
        }

        if (req.method === 'POST') {
            // Only admins can create units
            const { user, profile } = await requireAdminUser(req)
            console.log('API: POST User authenticated:', user?.id, 'Role:', profile?.role)

            const { name } = req.body

            if (!name) {
                return res.status(400).json({ error: 'Unit name is required' })
            }

            const { data, error } = await supabaseAdmin
                .from('service_units')
                .insert({ name })
                .select()
                .single()

            if (error) {
                if (error.code === '23505') { // Unique violation
                    return res.status(409).json({ error: 'Unit already exists' })
                }
                throw error
            }

            return res.status(201).json({ unit: data })
        }

        return res.status(405).json({ error: 'Method not allowed' })
    } catch (error) {
        console.error('Admin units error:', error)
        console.error('Stack:', error.stack)
        const status = error.status || 500
        return res.status(status).json({ error: error.message })
    }
}
