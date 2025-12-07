import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase admin client not configured' })
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { category_id, city_id } = req.query

    if (!category_id || !city_id) {
      return res.status(400).json({ error: 'category_id and city_id are required' })
    }

    console.log('🔍 Fetching services for:', { city_id, category_id })

    const { data, error } = await supabaseAdmin
      .from('city_services')
      .select(`
        service:services(
          *,
          category:service_categories(*)
        )
      `)
      .eq('city_id', city_id)
      .eq('is_enabled', true)

    if (error) throw error

    console.log('📦 Raw city_services data:', data?.length, 'records')
    console.log('📦 Sample:', data?.[0])

    const allServices = (data || []).map(item => item.service).filter(s => s)
    console.log('🔧 All services before filter:', allServices.map(s => ({ id: s.id, name: s.name, category_id: s.category_id, is_active: s.is_active })))

    const services = allServices.filter(service => service.category_id == category_id && service.is_active)
    console.log('✅ Filtered services:', services.length)

    const serviceIds = services.map(service => service.id)
    let subservicesMap = {}
    let subSubservicesMap = {}

    if (serviceIds.length > 0) {
      // Fetch sub-services
      const { data: subservices, error: subError } = await supabaseAdmin
        .from('service_subservices')
        .select('*')
        .in('service_id', serviceIds)
        .eq('is_active', true)

      if (subError) throw subError

      // Build map of sub-services by service_id
      subservicesMap = (subservices || []).reduce((acc, sub) => {
        acc[sub.service_id] = acc[sub.service_id] || []
        acc[sub.service_id].push(sub)
        return acc
      }, {})

      // Fetch sub-sub-services (addons) for all sub-services
      const subServiceIds = (subservices || []).map(sub => sub.id)
      if (subServiceIds.length > 0) {
        const { data: subSubservices, error: subSubError } = await supabaseAdmin
          .from('service_sub_subservices')
          .select('*')
          .in('sub_service_id', subServiceIds)
          .eq('is_active', true)

        if (subSubError) throw subSubError

        // Build map of sub-sub-services by sub_service_id
        subSubservicesMap = (subSubservices || []).reduce((acc, subSub) => {
          acc[subSub.sub_service_id] = acc[subSub.sub_service_id] || []
          acc[subSub.sub_service_id].push(subSub)
          return acc
        }, {})
      }
    }

    // Build complete service hierarchy
    const servicesWithVariants = services.map(service => ({
      ...service,
      sub_services: (subservicesMap[service.id] || []).map(subService => ({
        ...subService,
        sub_subservices: subSubservicesMap[subService.id] || []
      }))
    }))

    return res.status(200).json({ services: servicesWithVariants })
  } catch (error) {
    console.error('Services listing error:', error)
    return res.status(500).json({ error: error.message })
  }
}

