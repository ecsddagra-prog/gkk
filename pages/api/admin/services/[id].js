import { supabaseAdmin } from '../../../../lib/supabase'
import { requireAdminUser } from '../../../../lib/api-auth'

export default async function handler(req, res) {
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase admin client not configured' })
  }

  const { id } = req.query
  if (!id) {
    return res.status(400).json({ error: 'Service ID missing in request path' })
  }

  try {
    await requireAdminUser(req)

    if (req.method === 'PUT') {
      const { id: bodyId, sub_services, ...serviceUpdates } = req.body || {}

      if (bodyId && bodyId !== id) {
        return res.status(400).json({ error: 'Payload ID mismatch' })
      }

      // Only include valid service table columns
      const updates = {
        category_id: serviceUpdates.category_id,
        name: serviceUpdates.name,
        description: serviceUpdates.description,
        base_price: serviceUpdates.base_price,
        min_price: serviceUpdates.min_price,
        max_price: serviceUpdates.max_price,
        is_fixed_location: serviceUpdates.is_fixed_location,
        min_radius_km: serviceUpdates.min_radius_km,
        max_radius_km: serviceUpdates.max_radius_km,
        is_active: serviceUpdates.is_active,
        image_url: serviceUpdates.image_url
      }

      // Remove undefined values
      Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key])

      // Update service
      const { data: service, error } = await supabaseAdmin
        .from('services')
        .update(updates)
        .eq('id', id)
        .select('*, category:service_categories(*)')
        .single()

      if (error) throw error

      // Handle sub-services update if provided
      if (sub_services && Array.isArray(sub_services)) {
        // Delete existing sub-services (cascade will handle sub-sub-services if configured, 
        // but we should be careful. Assuming ON DELETE CASCADE on DB side for sub-sub-services)
        // If not, we might need to delete sub-sub-services explicitly first.
        // For now, let's assume standard cascade or we can do a quick check/delete.

        // Explicitly deleting sub-services. 
        // Note: This changes IDs.
        await supabaseAdmin
          .from('service_subservices')
          .delete()
          .eq('service_id', id)

        // Insert new sub-services
        if (sub_services.length > 0) {
          for (const sub of sub_services) {
            // Create sub-service
            const { data: createdSubService, error: subError } = await supabaseAdmin
              .from('service_subservices')
              .insert({
                service_id: id,
                name: sub.name,
                base_charge: sub.base_charge || 0,
                image_url: sub.image_url || null,
                is_active: true
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
      }

      return res.status(200).json({ service })
    }

    if (req.method === 'GET') {
      const { data: service, error } = await supabaseAdmin
        .from('services')
        .select('*, category:service_categories(*), sub_services:service_subservices(*)')
        .eq('id', id)
        .single()

      if (error) throw error
      return res.status(200).json({ service })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Admin service update error:', error)
    const status = error.status || 500
    return res.status(status).json({ error: error.message })
  }
}

