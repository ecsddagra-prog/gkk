import { supabaseAdmin } from '../../../../lib/supabase'
import { requireAuthUser } from '../../../../lib/api-auth'

export default async function handler(req, res) {
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase admin client not configured' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query
  const { provider_quote_id } = req.body || {}

  if (!id || !provider_quote_id) {
    return res.status(400).json({ error: 'Rate quote ID and provider_quote_id are required' })
  }

  try {
    const user = await requireAuthUser(req)

    const { data: rateQuote, error: rateQuoteError } = await supabaseAdmin
      .from('rate_quotes')
      .select('*')
      .eq('id', id)
      .single()

    if (rateQuoteError || !rateQuote) {
      return res.status(404).json({ error: 'Rate quote not found' })
    }

    if (rateQuote.user_id !== user.id) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const { data: providerQuote, error: providerQuoteError } = await supabaseAdmin
      .from('provider_quotes')
      .select('*')
      .eq('id', provider_quote_id)
      .eq('rate_quote_id', id)
      .single()

    if (providerQuoteError || !providerQuote) {
      return res.status(404).json({ error: 'Provider quote not found' })
    }

    const { data: address } = await supabaseAdmin
      .from('user_addresses')
      .select('*')
      .eq('id', rateQuote.address_id)
      .single()

    const details = rateQuote.details || {}
    const serviceAddress = details.service_address || address?.address_line1
    const serviceLat = details.service_lat || address?.latitude
    const serviceLng = details.service_lng || address?.longitude
    const scheduledDate = details.scheduled_date ? new Date(details.scheduled_date) : null

    // Fetch selected sub-services
    let selectedSubServices = []
    let selectedAddons = []
    const sub_service_ids = details.sub_service_ids
    const sub_subservice_ids = details.sub_subservice_ids

    if (sub_service_ids && Array.isArray(sub_service_ids) && sub_service_ids.length > 0) {
      const { data: subServices } = await supabaseAdmin
        .from('service_subservices')
        .select('*')
        .in('id', sub_service_ids)
        .eq('service_id', rateQuote.service_id)

      if (subServices) selectedSubServices = subServices
    }

    // Fetch selected addons
    if (sub_subservice_ids && Array.isArray(sub_subservice_ids) && sub_subservice_ids.length > 0) {
      const { data: addons } = await supabaseAdmin
        .from('service_sub_subservices')
        .select('*')
        .in('id', sub_subservice_ids)

      if (addons) selectedAddons = addons
    }

    // Construct a summary name for the booking
    let bookingSubServiceName = selectedSubServices.length > 0
      ? selectedSubServices.map(s => s.name).join(', ')
      : details.sub_service_names || null

    // Append addon names if any
    if (selectedAddons.length > 0) {
      const addonNames = selectedAddons.map(a => a.name).join(', ')
      bookingSubServiceName = bookingSubServiceName
        ? `${bookingSubServiceName} + ${addonNames}`
        : addonNames
    }

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert({
        user_id: user.id,
        provider_id: providerQuote.provider_id,
        service_id: rateQuote.service_id,
        sub_service_id: selectedSubServices.length > 0 ? selectedSubServices[0].id : rateQuote.sub_service_id,
        sub_service_name: bookingSubServiceName,
        base_charge: details.base_charge || providerQuote.quoted_price,
        hourly_charge: details.hourly_charge || null,
        city_id: rateQuote.city_id,
        address_id: rateQuote.address_id,
        service_address: serviceAddress,
        service_lat: serviceLat,
        service_lng: serviceLng,
        scheduled_date: scheduledDate,
        status: 'confirmed',
        rate_quote_id: rateQuote.id,
        final_price: providerQuote.quoted_price,
        for_whom: details.for_whom || 'self',
        other_contact: details.for_whom === 'other' ? details.other_contact : null
      })
      .select()
      .single()

    if (bookingError) throw bookingError

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

    if (selectedAddons.length > 0) {
      selectedAddons.forEach(addon => {
        bookingItems.push({
          booking_id: booking.id,
          sub_service_id: addon.id,
          sub_service_name: addon.name,
          price: addon.base_charge || 0,
          quantity: 1
        })
      })
    }

    if (bookingItems.length > 0) {
      await supabaseAdmin
        .from('booking_items')
        .insert(bookingItems)
    }

    await supabaseAdmin
      .from('provider_quotes')
      .update({ status: 'accepted' })
      .eq('id', provider_quote_id)

    await supabaseAdmin
      .from('provider_quotes')
      .update({ status: 'rejected' })
      .eq('rate_quote_id', id)
      .neq('id', provider_quote_id)

    await supabaseAdmin
      .from('rate_quotes')
      .update({ status: 'converted' })
      .eq('id', id)

    const { data: provider } = await supabaseAdmin
      .from('providers')
      .select('user_id')
      .eq('id', providerQuote.provider_id)
      .single()

    if (provider?.user_id) {
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: provider.user_id,
          title: 'Quote accepted',
          message: 'User accepted your rate quote. The booking has been created.',
          type: 'booking',
          reference_id: booking.id
        })
    }

    return res.status(201).json({ booking })
  } catch (error) {
    console.error('Rate quote accept error:', error)
    const status = error.status || 500
    return res.status(status).json({ error: error.message })
  }
}

