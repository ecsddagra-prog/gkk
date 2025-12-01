import { supabaseAdmin } from '../../../../lib/supabase'

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        // Verify super admin access
        const { authorization } = req.headers
        if (!authorization) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        // Get user from token
        const token = authorization.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        // Check role
        const { data: profile } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        console.log('Admin Users API Debug:', {
            userId: user.id,
            role: profile?.role,
            hasProfile: !!profile
        })

        if (!profile || profile.role !== 'superadmin') {
            return res.status(403).json({
                error: 'Forbidden',
                debug: {
                    userId: user.id,
                    role: profile?.role
                }
            })
        }

        // Fetch admins
        const { data, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .in('role', ['admin', 'superadmin'])
            .order('created_at', { ascending: false })

        if (error) throw error

        res.status(200).json(data)
    } catch (error) {
        console.error('Error fetching admins:', error)
        res.status(500).json({ error: 'Failed to fetch admins' })
    }
}
