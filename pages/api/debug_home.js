import { supabaseAdmin } from '../../lib/supabase'

export default async function handler(req, res) {
    try {
        // 1. Fetch Cities
        const { data: cities, error: citiesError } = await supabaseAdmin
            .from('cities')
            .select('*')
            .eq('is_active', true)
            .order('name')

        if (citiesError) throw citiesError

        // 2. Fetch Categories
        const { data: categories, error: categoriesError } = await supabaseAdmin
            .from('service_categories')
            .select('*')
            .eq('is_active', true)
            .order('name')

        if (categoriesError) throw categoriesError

        // 3. Fetch Services for first city
        let services = []
        let cityServicesRaw = []
        if (cities && cities.length > 0) {
            const cityId = cities[0].id
            const { data, error } = await supabaseAdmin
                .from('city_services')
                .select('service:services(*, category:service_categories(*))')
                .eq('city_id', cityId)
                .eq('is_enabled', true)

            if (error) throw error
            cityServicesRaw = data
            services = data?.map(item => item.service).filter(Boolean) || []
        }

        return res.status(200).json({
            citiesCount: cities?.length,
            cities: cities,
            categoriesCount: categories?.length,
            firstCityId: cities?.[0]?.id,
            servicesCount: services.length,
            cityServicesRawCount: cityServicesRaw?.length,
            servicesSample: services.slice(0, 2)
        })
    } catch (error) {
        return res.status(500).json({ error: error.message, stack: error.stack })
    }
}
