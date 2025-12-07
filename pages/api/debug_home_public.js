import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
    try {
        // 1. Fetch Cities
        const { data: cities, error: citiesError } = await supabase
            .from('cities')
            .select('*')
            .eq('is_active', true)
            .order('name')

        if (citiesError) throw citiesError

        // 2. Fetch Categories
        const { data: categories, error: categoriesError } = await supabase
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
            const { data, error } = await supabase
                .from('city_services')
                .select('service:services(*, category:service_categories(*))')
                .eq('city_id', cityId)
                .eq('is_enabled', true)

            if (error) throw error
            cityServicesRaw = data
            services = data?.map(item => item.service).filter(Boolean) || []
        }

        return res.status(200).json({
            status: 'success',
            citiesCount: cities?.length,
            categoriesCount: categories?.length,
            servicesCount: services.length,
            cityServicesRawCount: cityServicesRaw?.length
        })
    } catch (error) {
        return res.status(500).json({ status: 'error', error: error.message, code: error.code, details: error.details })
    }
}
