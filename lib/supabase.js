import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL and Anon Key are required. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.')
}

// Client for client-side operations (with RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations (bypasses RLS)
// Only create if service key is available (server-side only)
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// Helper function to get user
export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

// Helper function to get user profile
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data
}

// Helper function to check if user is admin
export async function isAdmin(userId) {
  const profile = await getUserProfile(userId)
  return profile?.role === 'admin' || profile?.role === 'superadmin'
}

// Helper function to calculate distance between two coordinates (Haversine formula)
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c // Distance in km
}

// Helper function to find nearest providers
export async function findNearestProviders(serviceId, lat, lng, radius = 10) {
  const { data: providers, error } = await supabase
    .from('providers')
    .select(`
      *,
      provider_services!inner(service_id),
      users(id, full_name, email, phone)
    `)
    .eq('provider_services.service_id', serviceId)
    .eq('is_verified', true)
    .eq('is_suspended', false)
    .eq('is_available', true)
    .eq('is_online', true)
  
  if (error) throw error
  
  // Filter by distance
  const nearbyProviders = providers
    .map(provider => {
      const distance = calculateDistance(
        lat, lng,
        provider.current_lat || provider.fixed_location_lat,
        provider.current_lng || provider.fixed_location_lng
      )
      return { ...provider, distance }
    })
    .filter(provider => provider.distance <= radius)
    .sort((a, b) => a.distance - b.distance)
  
  return nearbyProviders
}

// Note: generateReferralCode is now in lib/utils.js

