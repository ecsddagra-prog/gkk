import { supabaseAdmin } from '../../../lib/supabase'
import { requireProviderUser } from '../../../lib/api-auth'

export default async function handler(req, res) {
    try {
        const { provider } = await requireProviderUser(req)

        if (req.method === 'GET') {
            return res.status(200).json({
                service_radius_km: provider.service_radius_km,
                is_fixed_location: provider.is_fixed_location,
                fixed_location_lat: provider.fixed_location_lat,
                fixed_location_lng: provider.fixed_location_lng,
                fixed_location_address: provider.fixed_location_address,
                is_online: provider.is_online,
                current_lat: provider.current_lat,
                current_lng: provider.current_lng
            })
        }

        if (req.method === 'PUT') {
            const {
                service_radius_km,
                is_fixed_location,
                fixed_location_lat,
                fixed_location_lng,
                fixed_location_address,
                is_online
            } = req.body

            const { error } = await supabaseAdmin
                .from('providers')
                .update({
                    service_radius_km,
                    is_fixed_location,
                    fixed_location_lat,
                    fixed_location_lng,
                    fixed_location_address,
                    is_online,
                    updated_at: new Date()
                })
                .eq('id', provider.id)

            if (error) throw error

            return res.status(200).json({ success: true })
        }

        res.setHeader('Allow', ['GET', 'PUT'])
        res.status(405).end(`Method ${req.method} Not Allowed`)

    } catch (error) {
        console.error('API Error:', error)
        res.status(error.status || 500).json({ error: error.message })
    }
}
