import { supabaseAdmin } from '../../../lib/supabase'
import { requireAdminUser } from '../../../lib/api-auth'

export default async function handler(req, res) {
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase admin client not configured' })
  }

  try {
    await requireAdminUser(req)

    if (req.method === 'GET') {
      const { city_id } = req.query

      let query = supabaseAdmin
        .from('services')
        .select(`
          *, 
          category:service_categories(*), 
          subservices:service_subservices(*)
        `)

      if (city_id) {
        // Get services enabled for this city
        query = supabaseAdmin
          .from('city_services')
          .select(`
            service:services(
              *, 
              category:service_categories(*), 
              subservices:service_subservices(*)
            )
          `)
          .eq('city_id', city_id)
          .eq('is_enabled', true)
      }

      const { data, error } = await query

      if (error) throw error
      return res.status(200).json({ services: data })
    }

    if (req.method === 'POST') {
      const {
        category_id,
        new_category, // { name, image_url, icon }
        name,
        description,
        base_price,
        min_price,
        max_price,
        is_fixed_location,
        min_radius_km,
        max_radius_km,
        is_active,
        image_url,
        pricing_unit,
        sub_services // Array of { name, base_charge, image_url, sub_subservices }
      } = req.body

      if ((!category_id && !new_category) || !name) {
        return res.status(400).json({ error: 'Category and name are required' })
      }

      let finalCategoryId = category_id

      // 1. Create new category if provided
      if (new_category && new_category.name) {
        const { data: catData, error: catError } = await supabaseAdmin
          .from('service_categories')
          .insert({
            name: new_category.name,
            image_url: new_category.image_url || null,
            icon: new_category.icon || null,
            is_active: true
          })
          .select()
          .single()

        if (catError) throw catError
        finalCategoryId = catData.id
      }

      // 2. Create Service
      const { data: service, error } = await supabaseAdmin
        .from('services')
        .insert({
          category_id: finalCategoryId,
          name,
          description,
          base_price,
          min_price,
          max_price,
          is_fixed_location: is_fixed_location || false,
          min_radius_km: min_radius_km || 5.0,
          max_radius_km: max_radius_km || 50.0,
          is_active: is_active !== undefined ? is_active : true,
          image_url: image_url || null,
          pricing_unit: pricing_unit || 'job'
        })
        .select('*, category:service_categories(*)')
        .single()

      if (error) throw error

      // 3. Create Sub-services and their sub-sub-services
      if (sub_services && Array.isArray(sub_services) && sub_services.length > 0) {
        for (const sub of sub_services) {
          // Create sub-service
          const { data: createdSubService, error: subError } = await supabaseAdmin
            .from('service_subservices')
            .insert({
              service_id: service.id,
              name: sub.name,
              base_charge: sub.base_charge || 0,
              image_url: sub.image_url || null,
              is_active: true,
              pricing_unit: sub.pricing_unit || 'job'
            })
            .select()
            .single()

          if (subError) {
            console.error('Error creating sub-service:', subError)
            continue
          }

          // Create sub-sub-services for this sub-service
          if (sub.sub_subservices && Array.isArray(sub.sub_subservices) && sub.sub_subservices.length > 0) {
            const subSubServicesPayload = sub.sub_subservices.map(subSub => ({
              sub_service_id: createdSubService.id,
              name: subSub.name,
              description: subSub.description || null,
              base_charge: subSub.base_charge || 0,
              image_url: subSub.image_url || null,
              is_active: true
            }))

            const { error: subSubError } = await supabaseAdmin
              .from('service_sub_subservices')
              .insert(subSubServicesPayload)

            if (subSubError) {
              console.error('Error creating sub-sub-services:', subSubError)
            }
          }
        }
      }

      return res.status(201).json({ service })
    }

    // PUT method removed - handled in [id].js

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Admin services error:', error)
    const status = error.status || 500
    return res.status(status).json({ error: error.message })
  }
}
