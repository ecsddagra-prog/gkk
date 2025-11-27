import { supabaseAdmin } from '../../../lib/supabase'
import { requireProviderUser } from '../../../lib/api-auth'

export default async function handler(req, res) {
    try {
        const { provider } = await requireProviderUser(req)

        if (req.method === 'GET') {
            // Fetch all available services and join with provider's active services
            // Filter by provider's business category
            const { data: allServices, error: servicesError } = await supabaseAdmin
                .from('services')
                .select(`
          id, 
          name, 
          category_id, 
          base_price, 
          min_price, 
          max_price,
          service_categories(name)
        `)
                .eq('is_active', true)
                .eq('category_id', provider.business_category_id)

            if (servicesError) throw servicesError

            // Fetch provider's specific service settings
            const { data: providerServices, error: psError } = await supabaseAdmin
                .from('provider_services')
                .select('*')
                .eq('provider_id', provider.id)

            if (psError) throw psError

            // Merge data
            const services = allServices.map(service => {
                const ps = providerServices.find(p => p.service_id === service.id)
                return {
                    ...service,
                    is_enabled: !!ps?.is_active,
                    provider_price: ps?.base_price || service.base_price,
                    inspection_fee: ps?.inspection_fee || 0,
                    emergency_fee: ps?.emergency_fee || 0,
                    ps_id: ps?.id
                }
            })

            // Fetch subservices for these services
            const serviceIds = services.map(s => s.id)
            const { data: subservices, error: subError } = await supabaseAdmin
                .from('service_subservices')
                .select('*')
                .in('service_id', serviceIds)
                .eq('is_active', true)
                .order('created_at', { ascending: true })

            if (subError) throw subError

            // Attach subservices to services
            const servicesWithSub = services.map(service => ({
                ...service,
                subservices: subservices.filter(sub => sub.service_id === service.id)
            }))

            return res.status(200).json({ services: servicesWithSub })
        }

        if (req.method === 'PUT') {
            const { service_id, is_enabled, base_price, inspection_fee, emergency_fee } = req.body

            if (!service_id) {
                return res.status(400).json({ error: 'Service ID is required' })
            }

            // Check if entry exists
            const { data: existing } = await supabaseAdmin
                .from('provider_services')
                .select('id')
                .eq('provider_id', provider.id)
                .eq('service_id', service_id)
                .single()

            if (existing) {
                // Update
                const { error } = await supabaseAdmin
                    .from('provider_services')
                    .update({
                        is_active: is_enabled,
                        base_price,
                        inspection_fee,
                        emergency_fee,
                        updated_at: new Date()
                    })
                    .eq('id', existing.id)

                if (error) throw error
            } else {
                // Insert
                const { error } = await supabaseAdmin
                    .from('provider_services')
                    .insert({
                        provider_id: provider.id,
                        service_id,
                        is_active: is_enabled,
                        base_price,
                        inspection_fee,
                        emergency_fee
                    })

                if (error) throw error
            }

            return res.status(200).json({ success: true })
        }

        res.setHeader('Allow', ['GET', 'PUT'])
        res.status(405).end(`Method ${req.method} Not Allowed`)

    } catch (error) {
        console.error('API Error:', error)
        res.status(error.status || 500).json({ error: error.message })
    }
}
