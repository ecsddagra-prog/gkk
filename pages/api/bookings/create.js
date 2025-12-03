import { supabaseAdmin } from '../../../lib/supabase'

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Distance in km
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase admin client not configured' })
  }

  try {
    console.log('📥 Booking creation request received:', JSON.stringify(req.body, null, 2))

    const {
      user_id,
      service_id,
      address_id,
      service_address,
      service_lat,
      service_lng,
      scheduled_date,
      user_quoted_price,
      city_id,
      sub_service_ids, // Array of UUIDs
      sub_subservice_ids, // Array of addon UUIDs
      base_charge, // Legacy/Fallback
      hourly_charge, // Legacy/Fallback
      for_whom = 'self',
      other_contact
    } = req.body

    // Validation
    if (!user_id || !service_id || !service_address) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    if (for_whom !== 'self' && for_whom !== 'other') {
      return res.status(400).json({ error: 'Invalid for_whom value' })
    }

    if (for_whom === 'other') {
      if (!other_contact?.name || !other_contact?.phone) {
        return res.status(400).json({ error: 'Name and phone are required for someone else bookings' })
      }
    }

    // Get service details
    const { data: service, error: serviceError } = await supabaseAdmin
      .from('services')
      .select('*, category:service_categories(*)')
      .eq('id', service_id)
      .single()

    if (serviceError || !service) {
      return res.status(404).json({ error: 'Service not found' })
    }

    // Check if service is enabled in the city
    const { data: cityService } = await supabaseAdmin
      .from('city_services')
      .select('*')
      .eq('city_id', city_id)
      .eq('service_id', service_id)
      .eq('is_enabled', true)
      .single()

    if (!cityService) {
      return res.status(400).json({ error: 'Service not available in this city' })
    }

    // Fetch selected sub-services
    let selectedSubServices = []
    let selectedAddons = []
    let totalBaseCharge = 0

    if (sub_service_ids && Array.isArray(sub_service_ids) && sub_service_ids.length > 0) {
      const { data: subServices, error: subServicesError } = await supabaseAdmin
        .from('service_subservices')
        .select('*')
        .in('id', sub_service_ids)
        .eq('service_id', service_id)
        .eq('is_active', true)

      if (subServicesError) {
        return res.status(400).json({ error: 'Error fetching sub-services' })
      }

      if (subServices.length !== sub_service_ids.length) {
        return res.status(400).json({ error: 'Some selected sub-services are invalid or inactive' })
      }

      selectedSubServices = subServices
      totalBaseCharge = selectedSubServices.reduce((sum, sub) => sum + (sub.base_charge || 0), 0)
    } else {
      // Fallback to service base price if no sub-services (or legacy behavior)
      totalBaseCharge = service.base_price || 0
    }

    // Fetch selected addons (sub-sub-services)
    if (sub_subservice_ids && Array.isArray(sub_subservice_ids) && sub_subservice_ids.length > 0) {
      const { data: addons, error: addonsError } = await supabaseAdmin
        .from('service_sub_subservices')
        .select('*')
        .in('id', sub_subservice_ids)
        .eq('is_active', true)

      if (addonsError) {
        return res.status(400).json({ error: 'Error fetching addons' })
      }

      if (addons.length !== sub_subservice_ids.length) {
        return res.status(400).json({ error: 'Some selected addons are invalid or inactive' })
      }

      selectedAddons = addons
      // Add addon prices to total
      totalBaseCharge += selectedAddons.reduce((sum, addon) => sum + (addon.base_charge || 0), 0)
    }

    // Get user address if provided
    let addressData = null
    if (address_id) {
      const { data: addr } = await supabaseAdmin
        .from('user_addresses')
        .select('*')
        .eq('id', address_id)
        .single()
      addressData = addr
    }

    // Find nearest available providers
    let provider_id = null
    if (service_lat && service_lng) {
      // Get providers offering this service
      const { data: providerServices } = await supabaseAdmin
        .from('provider_services')
        .select('provider_id, provider:providers!bookings_provider_id_fkey(*)')
        .eq('service_id', service_id)
        .eq('is_active', true)

      if (providerServices && providerServices.length > 0) {
        // Filter and calculate distances
        const providersWithDistance = providerServices
          .map(ps => {
            const provider = ps.provider
            if (!provider || !provider.is_verified || provider.is_suspended || !provider.is_available || !provider.is_online) {
              return null
            }

            const providerLat = provider.current_lat || provider.fixed_location_lat
            const providerLng = provider.current_lng || provider.fixed_location_lng

            if (!providerLat || !providerLng) return null

            const distance = calculateDistance(service_lat, service_lng, providerLat, providerLng)

            if (distance > service.max_radius_km) return null

            return {
              id: provider.id,
              distance,
              provider
            }
          })
          .filter(Boolean)
          .sort((a, b) => a.distance - b.distance)

        if (providersWithDistance.length > 0) {
          provider_id = providersWithDistance[0].id
        }
      }
    }

    // Construct a summary name for the booking
    let bookingSubServiceName = selectedSubServices.length > 0
      ? selectedSubServices.map(s => s.name).join(', ')
      : service.name

    // Append addon names if any
    if (selectedAddons.length > 0) {
      const addonNames = selectedAddons.map(a => a.name).join(', ')
      bookingSubServiceName += ` + ${addonNames}`
    }

    // Create booking
    const bookingData = {
      user_id,
      service_id,
      provider_id,
      city_id,
      address_id,
      service_address,
      service_lat: service_lat ? parseFloat(service_lat) : null,
      service_lng: service_lng ? parseFloat(service_lng) : null,
      scheduled_date: scheduled_date ? new Date(scheduled_date) : null,
      status: user_quoted_price ? 'quote_requested' : 'pending',
      quote_status: user_quoted_price ? 'user_quoted' : 'none',
      user_quoted_price: user_quoted_price ? parseFloat(user_quoted_price) : null,
      // Store primary sub-service ID if any, or null. 
      // Ideally bookings table should rely on booking_items, but for backward compat we keep this.
      sub_service_id: selectedSubServices.length > 0 ? selectedSubServices[0].id : null,
      sub_service_name: bookingSubServiceName,
      base_charge: totalBaseCharge,
      final_price: user_quoted_price ? null : totalBaseCharge,
      for_whom
    }

    // Only add other_contact if booking for someone else
    if (for_whom === 'other' && other_contact) {
      bookingData.other_contact = other_contact
    }

    console.log('📝 Creating booking with data:', JSON.stringify(bookingData, null, 2))

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert(bookingData)
      .select()
      .single()

    if (bookingError) {
      console.error('❌ Booking creation error:', bookingError)
      throw bookingError
    }

    console.log('✅ Booking created successfully:', booking.id)

    // Insert Booking Items
    const bookingItems = []

    if (selectedSubServices.length > 0) {
      selectedSubServices.forEach(sub => {
        bookingItems.push({
          booking_id: booking.id,
          sub_service_id: sub.id,
          sub_service_name: sub.name,
          price: sub.base_charge || 0,
          quantity: 1
        })
      })
    }

    // Add addons to booking items
    if (selectedAddons.length > 0) {
      selectedAddons.forEach(addon => {
        bookingItems.push({
          booking_id: booking.id,
          sub_service_id: addon.id, // Using same column for addon ID
          sub_service_name: addon.name,
          price: addon.base_charge || 0,
          quantity: 1
        })
      })
    }

    if (bookingItems.length > 0) {
      const { error: itemsError } = await supabaseAdmin
        .from('booking_items')
        .insert(bookingItems)

      if (itemsError) {
        console.error('Error creating booking items:', itemsError)
        // Note: We might want to rollback booking creation here in a real transaction
      }
    }

    // If user quoted a price, create a quote record
    if (user_quoted_price) {
      await supabaseAdmin
        .from('booking_quotes')
        .insert({
          booking_id: booking.id,
          quoted_by: 'user',
          quoted_price: user_quoted_price
        })
    }

    // Create notification for provider if assigned
    if (provider_id) {
      const { data: provider } = await supabaseAdmin
        .from('providers')
        .select('user_id')
        .eq('id', provider_id)
        .single()

      if (provider) {
        await supabaseAdmin
          .from('notifications')
          .insert({
            user_id: provider.user_id,
            title: 'New Booking Request',
            message: `You have a new booking request for ${service.name}`,
            type: 'booking',
            reference_id: booking.id
          })
      }
    }

    return res.status(201).json({ booking })
  } catch (error) {
    console.error('Create booking error:', error)
    return res.status(500).json({ error: error.message })
  }
}

