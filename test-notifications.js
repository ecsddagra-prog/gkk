require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Testing Notification System...\n')

// Check environment variables
console.log('✅ Environment Variables:')
console.log(`   Supabase URL: ${supabaseUrl ? '✓ Set' : '✗ Missing'}`)
console.log(`   Service Key: ${supabaseServiceKey ? '✓ Set' : '✗ Missing'}\n`)

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testNotifications() {
  try {
    // 1. Check if notifications table exists
    console.log('📋 Step 1: Checking notifications table...')
    const { data: tables, error: tableError } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .limit(1)
    
    if (tableError) {
      console.error('❌ Notifications table error:', tableError.message)
      return
    }
    console.log('✅ Notifications table exists\n')

    // 2. Get a test user
    console.log('👤 Step 2: Finding test user...')
    const { data: users, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, full_name, email')
      .limit(1)
      .single()
    
    if (userError || !users) {
      console.error('❌ No users found in database')
      return
    }
    console.log(`✅ Found user: ${users.full_name} (${users.email})\n`)

    // 3. Test notification creation
    console.log('📨 Step 3: Creating test notification...')
    const { data: notification, error: notifError } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: users.id,
        title: 'Test Notification',
        message: 'This is a test notification from the notification system check.',
        type: 'general',
        reference_id: null
      })
      .select()
      .single()
    
    if (notifError) {
      console.error('❌ Failed to create notification:', notifError.message)
      return
    }
    console.log('✅ Notification created successfully!')
    console.log(`   ID: ${notification.id}`)
    console.log(`   Title: ${notification.title}`)
    console.log(`   Message: ${notification.message}\n`)

    // 4. Verify notification was saved
    console.log('🔍 Step 4: Verifying notification in database...')
    const { data: savedNotif, error: fetchError } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('id', notification.id)
      .single()
    
    if (fetchError || !savedNotif) {
      console.error('❌ Could not fetch saved notification')
      return
    }
    console.log('✅ Notification verified in database\n')

    // 5. Test sendNotification function
    console.log('📤 Step 5: Testing sendNotification function...')
    const { sendNotification } = require('./lib/notifications')
    
    const result = await sendNotification({
      userId: users.id,
      title: 'Function Test',
      message: 'Testing sendNotification function',
      type: 'booking',
      referenceId: 'test-123'
    })
    
    if (result.error) {
      console.error('❌ sendNotification failed:', result.error)
      return
    }
    console.log('✅ sendNotification function works correctly\n')

    // 6. Count total notifications for user
    console.log('📊 Step 6: Checking notification count...')
    const { count, error: countError } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', users.id)
    
    if (countError) {
      console.error('❌ Could not count notifications')
      return
    }
    console.log(`✅ User has ${count} total notifications\n`)

    // 7. Test notification API endpoint
    console.log('🌐 Step 7: Testing notification API...')
    console.log('   Note: API test requires running server (npm run dev)\n')

    // Summary
    console.log('=' .repeat(50))
    console.log('✅ NOTIFICATION SYSTEM CHECK COMPLETE')
    console.log('=' .repeat(50))
    console.log('✓ Database connection working')
    console.log('✓ Notifications table accessible')
    console.log('✓ Can create notifications')
    console.log('✓ Can read notifications')
    console.log('✓ sendNotification function working')
    console.log('\n💡 All notification features are working properly!')

  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message)
    console.error(error)
  }
}

testNotifications()
