import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        // Verify admin access
        const { authorization } = req.headers
        if (!authorization) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const token = authorization.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const { data: profile } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
            return res.status(403).json({ error: 'Forbidden' })
        }

        // Get status filter from query params
        const { status } = req.query

        let query = supabaseAdmin
            .from('bookings')
            .select('*, service:services(*), user:users(*), provider:providers(*, user:users(*))')
            .order('created_at', { ascending: false })
            .limit(100)

        if (status && status !== 'all') {
            query = query.eq('status', status)
        }

        const { data, error: queryError } = await query

        if (queryError) {
            console.error('Query error:', queryError)
            throw queryError
        }

        console.log(`Admin bookings query returned ${data?.length || 0} bookings`)

        res.status(200).json(data || [])
    } catch (error) {
        console.error('Error fetching admin bookings:', error)
        res.status(500).json({ error: 'Failed to fetch bookings' })
    }
}
