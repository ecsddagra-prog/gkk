import { supabaseAdmin } from '../../../lib/supabase'
import { requireAuthUser } from '../../../lib/api-auth'

async function getProvider(userId) {
  const { data, error } = await supabaseAdmin
    .from('providers')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    const err = new Error('Provider profile not found')
    err.status = 404
    throw err
  }

  return data
}

async function canManageService(providerId, serviceId) {
  if (!serviceId) return false

  const { data: providerServices } = await supabaseAdmin
    .from('provider_services')
    .select('id')
    .eq('provider_id', providerId)
    .eq('service_id', serviceId)
    .limit(1)

  if (providerServices && providerServices.length > 0) return true

  const { data: provider } = await supabaseAdmin
    .from('providers')
    .select('business_subcategory_id')
    .eq('id', providerId)
    .single()

  return provider?.business_subcategory_id === serviceId
}

export default async function handler(req, res) {
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase admin client not configured' })
  }

  try {
    const user = await requireAuthUser(req)
    const provider = await getProvider(user.id)

    if (req.method === 'GET') {
      const { service_id } = req.query
      const targetServiceId = service_id || provider.business_subcategory_id

      if (!targetServiceId) {
        return res.status(400).json({ error: 'service_id is required' })
      }

      const allowed = await canManageService(provider.id, targetServiceId)
      if (!allowed) {
        return res.status(403).json({ error: 'You cannot manage this service' })
      }

      const { data: subservices, error } = await supabaseAdmin
        .from('service_subservices')
        .select('*')
        .eq('service_id', targetServiceId)
        .order('created_at', { ascending: true })

      if (error) throw error

      return res.status(200).json({
        subservices: (subservices || []).map(sub => ({
          ...sub,
          can_edit: sub.created_by_provider_id === provider.id
        }))
      })
    }

    if (req.method === 'POST') {
      const {
        service_id,
        name,
        description,
        base_charge,
        per_hour_charge,
        pricing_type = 'fixed',
        is_active = true
      } = req.body || {}

      if (!service_id || !name) {
        return res.status(400).json({ error: 'service_id and name are required' })
      }

      const allowed = await canManageService(provider.id, service_id)
      if (!allowed) {
        return res.status(403).json({ error: 'You cannot manage this service' })
      }

      const payload = {
        service_id,
        name: name.trim(),
        description: description?.trim() || null,
        pricing_type,
        base_charge: base_charge !== undefined && base_charge !== '' ? Number(base_charge) : 0,
        per_hour_charge: per_hour_charge !== undefined && per_hour_charge !== '' ? Number(per_hour_charge) : null,
        is_active: Boolean(is_active),
        created_by_provider_id: provider.id,
        created_by_user_id: user.id
      }

      const { data: subservice, error } = await supabaseAdmin
        .from('service_subservices')
        .insert(payload)
        .select()
        .single()

      if (error) throw error

      return res.status(201).json({ subservice: { ...subservice, can_edit: true } })
    }

    if (req.method === 'PUT') {
      const { id, ...updates } = req.body || {}
      if (!id) {
        return res.status(400).json({ error: 'Sub-service id is required' })
      }

      const { data: subservice, error: fetchError } = await supabaseAdmin
        .from('service_subservices')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError || !subservice) {
        return res.status(404).json({ error: 'Sub-service not found' })
      }

      if (subservice.created_by_provider_id !== provider.id) {
        return res.status(403).json({ error: 'You can only edit your own sub-services' })
      }

      const payload = {
        name: updates.name?.trim() || subservice.name,
        description: updates.description?.trim() ?? subservice.description,
        pricing_type: updates.pricing_type || subservice.pricing_type,
        base_charge: updates.base_charge !== undefined && updates.base_charge !== ''
          ? Number(updates.base_charge)
          : subservice.base_charge,
        per_hour_charge: updates.per_hour_charge !== undefined && updates.per_hour_charge !== ''
          ? Number(updates.per_hour_charge)
          : subservice.per_hour_charge,
        is_active: updates.is_active !== undefined ? Boolean(updates.is_active) : subservice.is_active
      }

      const { data: updated, error } = await supabaseAdmin
        .from('service_subservices')
        .update(payload)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return res.status(200).json({ subservice: { ...updated, can_edit: true } })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Provider subservices error:', error)
    const status = error.status || 500
    return res.status(status).json({ error: error.message })
  }
}


