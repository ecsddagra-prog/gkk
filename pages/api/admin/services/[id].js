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
        // Get existing sub-services
        const { data: existingSubServices } = await supabaseAdmin
          .from('service_subservices')
          .select('id, name')
          .eq('service_id', id)

        const existingSubServiceIds = (existingSubServices || []).map(s => s.id)
        const processedIds = []

        // Process each sub-service from the form
        for (const sub of sub_services) {
          // Skip if name or base_charge is empty
          if (!sub.name || !sub.base_charge) {
            continue
          }

          // Check if this sub-service already exists (by ID)
          if (sub.id && existingSubServiceIds.includes(sub.id)) {
            // UPDATE existing sub-service
            const { error: updateError } = await supabaseAdmin
              .from('service_subservices')
              .update({
                name: sub.name,
                base_charge: sub.base_charge || 0,
                image_url: sub.image_url || null,
                is_active: sub.is_active !== undefined ? sub.is_active : true
              })
              .eq('id', sub.id)

            if (updateError) {
              console.error('Error updating sub-service:', updateError)
              continue
            }

            processedIds.push(sub.id)

            // Handle sub-sub-services for existing sub-service
            // Delete old sub-sub-services and insert new ones
            await supabaseAdmin
              .from('service_sub_subservices')
              .delete()
              .eq('sub_service_id', sub.id)

            if (sub.sub_subservices && Array.isArray(sub.sub_subservices) && sub.sub_subservices.length > 0) {
              const validSubSubServices = sub.sub_subservices.filter(subSub => subSub.name && subSub.base_charge)

              if (validSubSubServices.length > 0) {
                const subSubServicesPayload = validSubSubServices.map(subSub => ({
                  sub_service_id: sub.id,
                  name: subSub.name,
                  description: subSub.description || null,
                  base_charge: subSub.base_charge || 0,
                  image_url: subSub.image_url || null,
                  is_active: subSub.is_active !== undefined ? subSub.is_active : true
                }))

                await supabaseAdmin
                  .from('service_sub_subservices')
                  .insert(subSubServicesPayload)
              }
            }
          } else {
            // INSERT new sub-service
            const { data: createdSubService, error: subError } = await supabaseAdmin
              .from('service_subservices')
              .insert({
                service_id: id,
                name: sub.name,
                base_charge: sub.base_charge || 0,
                image_url: sub.image_url || null,
                is_active: sub.is_active !== undefined ? sub.is_active : true
              })
              .select()
              .single()

            if (subError) {
              console.error('Error creating sub-service:', subError)
              continue
            }

            if (createdSubService) {
              processedIds.push(createdSubService.id)

              // Create sub-sub-services for new sub-service
              if (sub.sub_subservices && Array.isArray(sub.sub_subservices) && sub.sub_subservices.length > 0) {
                const validSubSubServices = sub.sub_subservices.filter(subSub => subSub.name && subSub.base_charge)

                if (validSubSubServices.length > 0) {
                  const subSubServicesPayload = validSubSubServices.map(subSub => ({
                    sub_service_id: createdSubService.id,
                    name: subSub.name,
                    description: subSub.description || null,
                    base_charge: subSub.base_charge || 0,
                    image_url: subSub.image_url || null,
                    is_active: subSub.is_active !== undefined ? subSub.is_active : true
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
        }

        // Mark unused sub-services as inactive instead of deleting them
        // (to preserve foreign key references in rate_quotes)
        const unusedSubServiceIds = existingSubServiceIds.filter(subId => !processedIds.includes(subId))
        if (unusedSubServiceIds.length > 0) {
          await supabaseAdmin
            .from('service_subservices')
            .update({ is_active: false })
            .in('id', unusedSubServiceIds)
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

    if (req.method === 'DELETE') {
      const { error } = await supabaseAdmin
        .from('services')
        .delete()
        .eq('id', id)

      if (error) {
        if (error.code === '23503') {
          await supabaseAdmin
            .from('services')
            .update({ is_active: false })
            .eq('id', id)

          return res.status(200).json({
            message: 'Service has existing bookings/records. It has been deactivated instead of permanently deleted.',
            soft_deleted: true
          })
        }
        throw error
      }
      return res.status(200).json({ message: 'Service deleted successfully' })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Admin service update error:', error)
    const status = error.status || 500
    return res.status(status).json({ error: error.message })
  }
}
