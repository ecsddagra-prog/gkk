import { supabaseAdmin } from './supabase'

export async function requireAuthUser(req) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured')
  }

  const authHeader = req.headers.authorization
  if (!authHeader) {
    const error = new Error('Unauthorized')
    error.status = 401
    throw error
  }

  const token = authHeader.replace('Bearer ', '').trim()
  if (!token) {
    const error = new Error('Unauthorized')
    error.status = 401
    throw error
  }

  const { data, error: authError } = await supabaseAdmin.auth.getUser(token)
  if (authError || !data?.user) {
    const error = new Error('Invalid or expired token')
    error.status = 401
    throw error
  }

  return data.user
}

export async function requireAdminUser(req) {
  const user = await requireAuthUser(req)

  const { data: profile, error } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || !profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
    const err = new Error('Forbidden: Admin access required')
    err.status = 403
    throw err
  }

  return { user, profile }
}

export async function requireProviderUser(req) {
  const user = await requireAuthUser(req)

  const { data: profile, error } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || !profile || profile.role !== 'provider') {
    const err = new Error('Forbidden: Provider access required')
    err.status = 403
    throw err
  }

  const { data: provider, error: providerError } = await supabaseAdmin
    .from('providers')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (providerError || !provider) {
    const err = new Error('Provider profile not found')
    err.status = 404
    throw err
  }

  return { user, profile, provider }
}

// Alias for backward compatibility
export const verifyAuth = requireAuthUser

