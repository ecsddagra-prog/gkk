import { supabaseAdmin } from '../../../lib/supabase'
import { requireProviderUser } from '../../../lib/api-auth'

export default async function handler(req, res) {
    try {
        const { provider } = await requireProviderUser(req)

        if (req.method === 'GET') {
            // Get current location and all location settings
            const { data, error } = await supabaseAdmin
                .from('providers')
                .select('current_lat, current_lng, last_location_update, service_radius_km, is_online, is_fixed_location, fixed_location_lat, fixed_location_lng, fixed_location_address')
                .eq('id', provider.id)
                .single()

            if (error) throw error

            return res.status(200).json(data)
        }

        if (req.method === 'PUT') {
            const {
                latitude,
                longitude,
                is_online,
                service_radius_km,
                is_fixed_location,
                fixed_location_lat,
                fixed_location_lng,
                fixed_location_address
            } = req.body

            const updates = {}

            // If coordinates are provided, validate and update them
            if (latitude !== undefined && longitude !== undefined) {
                // Validate coordinates
                if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
                    return res.status(400).json({ error: 'Invalid coordinates' })
                }

                updates.current_lat = latitude
                updates.current_lng = longitude
                updates.last_location_update = new Date().toISOString()
            }

            // Update online status if provided
            if (typeof is_online !== 'undefined') {
                updates.is_online = is_online
            }

            // Update service radius if provided
            if (service_radius_km !== undefined) {
                updates.service_radius_km = service_radius_km
            }

            // Update fixed location settings if provided
            if (typeof is_fixed_location !== 'undefined') {
                updates.is_fixed_location = is_fixed_location
            }

            if (fixed_location_lat !== undefined) {
                updates.fixed_location_lat = fixed_location_lat
            }

            if (fixed_location_lng !== undefined) {
                updates.fixed_location_lng = fixed_location_lng
            }

            if (fixed_location_address !== undefined) {
                updates.fixed_location_address = fixed_location_address
            }

            // Ensure we have something to update
            if (Object.keys(updates).length === 0) {
                return res.status(400).json({ error: 'No updates provided' })
            }

            const { error } = await supabaseAdmin
                .from('providers')
                .update(updates)
                .eq('id', provider.id)

            if (error) throw error

            return res.status(200).json({
                success: true,
                message: 'Updated successfully',
                updates
            })
        }

        res.setHeader('Allow', ['GET', 'PUT'])
        res.status(405).end(`Method ${req.method} Not Allowed`)

    } catch (error) {
        console.error('Provider location API error:', error)
        res.status(error.status || 500).json({ error: error.message })
    }
}
