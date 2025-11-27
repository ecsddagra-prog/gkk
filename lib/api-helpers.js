// Helper function to check if supabaseAdmin is configured
export function checkSupabaseAdmin(supabaseAdmin) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured. Please set SUPABASE_SERVICE_ROLE_KEY in your environment variables.')
  }
  return true
}

// Helper function to validate required fields
export function validateRequiredFields(body, requiredFields) {
  const missing = requiredFields.filter(field => !body[field])
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`)
  }
}

