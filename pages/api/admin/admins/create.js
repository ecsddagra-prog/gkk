import { supabaseAdmin } from '../../../../lib/supabase'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
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

        if (!profile || profile.role !== 'superadmin') {
            return res.status(403).json({ error: 'Forbidden' })
        }

        const { email, password, full_name, role, city_id } = req.body

        // Create user using admin API
        const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name,
                role
            }
        })

        if (createError) throw createError

        // Update user profile
        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({
                full_name,
                role,
                city_id: city_id || null
            })
            .eq('id', authData.user.id)

        if (updateError) throw updateError

        res.status(200).json({ message: 'Admin created successfully', user: authData.user })
    } catch (error) {
        console.error('Error creating admin:', error)
        res.status(500).json({ error: error.message || 'Failed to create admin' })
    }
}
