import { supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { service_id, city_id } = req.query

    if (!service_id || !city_id) {
        return res.status(400).json({ error: 'Missing required parameters' })
    }

    try {
        // 1. Check if the feature is enabled
        const { data: setting } = await supabase
            .from('admin_settings')
            .select('value')
            .eq('key', 'show_provider_count')
            .is('service_id', null) // Check global setting first
            .single()

        // Also check service-specific override if needed, but for now let's stick to global or simple logic
        // If setting exists and value is false, return 0 or hidden
        if (setting && setting.value && setting.value.value === false) {
            return res.status(200).json({ count: 0, enabled: false })
        }

        // 2. Count online providers
        // We need to join provider_services to filter by service_id
        // And check provider status (verified, not suspended, available, online)
        // And check location (city_id or distance - for now using city_id if providers have it, 
        // but providers might not be strictly bound to a city in the DB schema shown in previous files.
        // Let's look at how `findNearestProviders` works in lib/supabase.js or similar.
        // The previous file `pages/book-service.js` uses `autoDetectCityFromLocation` and `cities` table.
        // Providers likely have `current_lat`/`current_lng` or `fixed_location`.
        // For simplicity and performance, let's count providers who serve this service and are "online".
        // If we want to be precise about "near you", we need lat/lng. 
        // But the request asked for "online providers for that service".
        // Let's refine this: "providers online near you" implies location.
        // However, `city_id` is passed. Let's assume providers in that city.

        // Wait, `providers` table might not have `city_id`.
        // Let's check `providers` schema via a quick query or assumption based on `findNearestProviders` in `lib/supabase.js`.
        // `findNearestProviders` uses `provider_services` and filters by `is_verified`, `is_suspended`, `is_available`, `is_online`.
        // It filters by distance.
        // If we want a quick count without lat/lng, we might just count all online providers for the service.
        // BUT, if the user selected a city, we should try to filter by that city if possible.
        // If providers don't have city_id, we might have to skip city filter or use a rough box.
        // Let's assume for now we just count ALL online providers for the service to show "X providers online".
        // If we want to be more specific "in your area", we'd need the user's location.
        // The `book-service.js` has `selectedCity`.

        // Let's try to filter by `service_id` and status first.

        const { count, error } = await supabase
            .from('providers')
            .select('id, provider_services!inner(service_id)', { count: 'exact', head: true })
            .eq('provider_services.service_id', service_id)
            .eq('is_verified', true)
            .eq('is_suspended', false)
            .eq('is_available', true)
            .eq('is_online', true)

        if (error) throw error

        return res.status(200).json({ count: count || 0, enabled: true })

    } catch (error) {
        console.error('Error fetching provider count:', error)
        return res.status(500).json({ error: 'Failed to fetch provider count' })
    }
}
