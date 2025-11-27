// Quick Database Connection Test
// Run with: node test-connection.js

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.log('Please set:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n')

  try {
    // Test 1: Check cities table
    console.log('1. Testing cities table...')
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select('*')
      .limit(1)

    if (citiesError) {
      console.error('❌ Cities table error:', citiesError.message)
      return false
    }
    console.log('✅ Cities table: OK')

    // Test 2: Check service categories
    console.log('\n2. Testing service_categories table...')
    const { data: categories, error: categoriesError } = await supabase
      .from('service_categories')
      .select('*')

    if (categoriesError) {
      console.error('❌ Categories error:', categoriesError.message)
      return false
    }
    console.log(`✅ Service categories: ${categories.length} found`)

    // Test 3: Check services
    console.log('\n3. Testing services table...')
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .limit(5)

    if (servicesError) {
      console.error('❌ Services error:', servicesError.message)
      return false
    }
    console.log(`✅ Services table: OK (${services.length} shown, more exist)`)

    // Test 4: Check admin settings
    console.log('\n4. Testing admin_settings table...')
    const { data: settings, error: settingsError } = await supabase
      .from('admin_settings')
      .select('*')

    if (settingsError) {
      console.error('❌ Settings error:', settingsError.message)
      return false
    }
    console.log(`✅ Admin settings: ${settings.length} found`)

    // Summary
    console.log('\n' + '='.repeat(50))
    console.log('✅ All database checks passed!')
    console.log('='.repeat(50))
    console.log('\n📊 Summary:')
    console.log(`   - Cities: ${cities.length > 0 ? 'OK' : 'Empty'}`)
    console.log(`   - Categories: ${categories.length}`)
    console.log(`   - Services: Available`)
    console.log(`   - Settings: ${settings.length}`)
    console.log('\n🎉 Database is ready to use!')

    return true
  } catch (error) {
    console.error('\n❌ Connection test failed:', error.message)
    return false
  }
}

testConnection()

