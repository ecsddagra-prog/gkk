/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disabled to fix Leaflet map initialization issue

  // Environment variables
  env: {
  },
};

// Validate critical environment variables at build time
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
]

const missingEnvVars = requiredEnvVars.filter(
  (envVar) => !process.env[envVar]
)

if (missingEnvVars.length > 0) {
  console.warn(
    '⚠️  Warning: Missing required environment variables:',
    missingEnvVars.join(', ')
  )
}

// Note: SUPABASE_SERVICE_ROLE_KEY is checked at runtime in lib/supabase.js
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    '⚠️  Warning: SUPABASE_SERVICE_ROLE_KEY not set. API routes will not work!'
  )
}

module.exports = nextConfig
