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

        // Get all provider users
        const { data: providerUsers } = await supabaseAdmin
            .from('users')
            .select('id, full_name, email, phone')
            .eq('role', 'provider')

        console.log(`Total provider users: ${providerUsers?.length || 0}`)

        // Get their provider profiles if they exist
        const providerUserIds = providerUsers?.map(u => u.id) || []

        const { data: providerProfiles } = await supabaseAdmin
            .from('providers')
            .select('*')
            .in('user_id', providerUserIds)

        console.log(`Providers with completed profiles: ${providerProfiles?.length || 0}`)

        // Fetch all service categories
        const { data: categories, error: catError } = await supabaseAdmin
            .from('service_categories')
            .select('id, name, icon')
            .order('name')

        if (catError) throw catError

        // For each category, find providers
        const stats = await Promise.all(
            categories.map(async (category) => {
                // Get all services in this category
                const { data: services } = await supabaseAdmin
                    .from('services')
                    .select('id')
                    .eq('category_id', category.id)

                const serviceIds = services?.map(s => s.id) || []

                if (serviceIds.length === 0) {
                    return {
                        category,
                        total: 0,
                        online: 0,
                        providers: []
                    }
                }

                // Find providers for this category
                const categoryProviders = []

                for (const providerProfile of providerProfiles || []) {
                    // Check if provider's business_subcategory_id is in this category
                    if (providerProfile.business_subcategory_id && serviceIds.includes(providerProfile.business_subcategory_id)) {
                        const userData = providerUsers.find(u => u.id === providerProfile.user_id)
                        categoryProviders.push({
                            id: providerProfile.id,
                            business_name: providerProfile.business_name,
                            is_verified: providerProfile.is_verified,
                            is_online: providerProfile.is_online,
                            is_available: providerProfile.is_available,
                            is_suspended: providerProfile.is_suspended,
                            rating: providerProfile.rating,
                            user: userData
                        })
                        continue
                    }

                    // Check provider_services table
                    const { data: providerServiceLinks } = await supabaseAdmin
                        .from('provider_services')
                        .select('service_id')
                        .eq('provider_id', providerProfile.id)
                        .in('service_id', serviceIds)
                        .limit(1)

                    if (providerServiceLinks && providerServiceLinks.length > 0) {
                        const userData = providerUsers.find(u => u.id === providerProfile.user_id)
                        const alreadyAdded = categoryProviders.some(p => p.id === providerProfile.id)
                        if (!alreadyAdded) {
                            categoryProviders.push({
                                id: providerProfile.id,
                                business_name: providerProfile.business_name,
                                is_verified: providerProfile.is_verified,
                                is_online: providerProfile.is_online,
                                is_available: providerProfile.is_available,
                                is_suspended: providerProfile.is_suspended,
                                rating: providerProfile.rating,
                                user: userData
                            })
                        }
                    }
                }

                const totalProviders = categoryProviders.length
                const onlineProviders = categoryProviders.filter(p => p.is_online && p.is_available && !p.is_suspended).length

                return {
                    category,
                    total: totalProviders,
                    online: onlineProviders,
                    providers: categoryProviders
                }
            })
        )

        console.log('Final stats:', stats.map(s => ({ category: s.category.name, total: s.total, online: s.online })))

        res.status(200).json({ stats })
    } catch (error) {
        console.error('Error fetching provider stats:', error)
        res.status(500).json({ error: 'Failed to fetch provider statistics' })
    }
}
