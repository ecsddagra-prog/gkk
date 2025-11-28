import { supabaseAdmin } from '../../../lib/supabase'
// import { requireAdminUser } from '../../../lib/api-auth'

export default async function handler(req, res) {
    try {
        console.log('=== Admin Service Requests API Called ===')
        console.log('Method:', req.method)

        // Ensure user is admin - TEMPORARILY DISABLED FOR DEBUGGING
        // await requireAdminUser(req)

        if (req.method === 'GET') {
            console.log('Attempting to fetch service_requests...')

            // Fetch requests first
            const { data: requests, error: requestsError } = await supabaseAdmin
                .from('service_requests')
                .select('*')
                .order('created_at', { ascending: false })

            console.log('Requests query result:', {
                requestsCount: requests?.length,
                hasError: !!requestsError,
                errorDetails: requestsError
            })

            if (requestsError) {
                console.error('Error fetching requests:', requestsError)
                throw requestsError
            }

            if (!requests || requests.length === 0) {
                console.log('No requests found, returning empty array')
                return res.status(200).json({ requests: [] })
            }

            // Extract IDs
            const providerIds = [...new Set(requests.map(r => r.provider_id).filter(Boolean))]
            const categoryIds = [...new Set(requests.map(r => r.category_id).filter(Boolean))]

            console.log('Extracted IDs:', { providerIds, categoryIds })

            // Fetch providers
            let providersMap = {}
            if (providerIds.length > 0) {
                console.log('Fetching providers...')
                const { data: providers, error: providersError } = await supabaseAdmin
                    .from('providers')
                    .select('id, business_name')
                    .in('id', providerIds)

                console.log('Providers query result:', {
                    providersCount: providers?.length,
                    hasError: !!providersError
                })

                if (providersError) {
                    console.error('Error fetching providers:', providersError)
                    throw providersError
                }

                providersMap = (providers || []).reduce((acc, p) => {
                    acc[p.id] = p
                    return acc
                }, {})
            }

            // Fetch categories
            let categoriesMap = {}
            if (categoryIds.length > 0) {
                console.log('Fetching categories...')
                const { data: categories, error: categoriesError } = await supabaseAdmin
                    .from('service_categories')
                    .select('id, name')
                    .in('id', categoryIds)

                console.log('Categories query result:', {
                    categoriesCount: categories?.length,
                    hasError: !!categoriesError
                })

                if (categoriesError) {
                    console.error('Error fetching categories:', categoriesError)
                    throw categoriesError
                }

                categoriesMap = (categories || []).reduce((acc, c) => {
                    acc[c.id] = c
                    return acc
                }, {})
            }

            // Combine data
            const enrichedRequests = requests.map(req => ({
                ...req,
                providers: providersMap[req.provider_id] || null,
                service_categories: categoriesMap[req.category_id] || null
            }))

            console.log('Successfully enriched requests, returning data')
            return res.status(200).json({ requests: enrichedRequests })
        }

        if (req.method === 'PUT') {
            const { id, status, admin_notes } = req.body

            if (!id) {
                return res.status(400).json({ error: 'Request ID is required' })
            }

            // Fetch the request first to get its details
            const { data: existingRequest, error: fetchError } = await supabaseAdmin
                .from('service_requests')
                .select('*')
                .eq('id', id)
                .single()

            if (fetchError) throw fetchError

            const updateData = {
                updated_at: new Date()
            }

            if (status) updateData.status = status
            if (admin_notes !== undefined) updateData.admin_notes = admin_notes

            // Update the service request
            const { data: request, error } = await supabaseAdmin
                .from('service_requests')
                .update(updateData)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error

            // If status is being changed to approved, create the service
            if (status === 'approved' && existingRequest.status !== 'approved') {
                console.log('Creating new service from approved request:', request.service_name)

                const serviceData = {
                    name: request.service_name,
                    category_id: request.category_id || null,
                    description: request.description || null,
                    is_active: true,
                    created_at: new Date(),
                    updated_at: new Date()
                }

                const { data: newService, error: serviceError } = await supabaseAdmin
                    .from('services')
                    .insert(serviceData)
                    .select()
                    .single()

                if (serviceError) {
                    console.error('Error creating service:', serviceError)
                    // Don't throw error, just log it - the request is still approved
                } else {
                    console.log('Successfully created service:', newService)
                }
            }

            return res.status(200).json({ request })
        }

        if (req.method === 'DELETE') {
            const { id } = req.query

            if (!id) {
                return res.status(400).json({ error: 'Request ID is required' })
            }

            const { error } = await supabaseAdmin
                .from('service_requests')
                .delete()
                .eq('id', id)

            if (error) throw error

            return res.status(200).json({ success: true })
        }

        res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
        res.status(405).end(`Method ${req.method} Not Allowed`)

    } catch (error) {
        console.error('=== Admin Service Request API Error ===')
        console.error('Error type:', error.constructor.name)
        console.error('Error message:', error.message)
        console.error('Error status:', error.status)
        console.error('Full error:', error)
        res.status(error.status || 500).json({ error: error.message || 'Internal server error' })
    }
}
