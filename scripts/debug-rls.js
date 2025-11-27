const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function main() {
    console.log('Testing RLS policies...')

    // 1. Sign in as the provider user
    // We need the password. If we don't have it, we can't easily test as "authenticated" user via anon client.
    // However, we can use the service_role client to *create* a session or just assume the issue exists based on evidence.
    // But to be sure, let's try to sign in with a known test account if possible.
    // Since I don't know the password for 'm@gmail.com', I'll try to sign up a NEW test user and test with them.

    const testEmail = `test_rls_${Date.now()}@example.com`
    const testPassword = 'password123'

    console.log(`Creating test user: ${testEmail}`)

    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword
    })

    if (authError) {
        console.error('Error creating test user:', authError)
        return
    }

    const userId = authData.user.id
    console.log(`Test user created. ID: ${userId}`)

    // 2. Try to insert a provider record (simulating registration, though real app uses API)
    // Actually, let's try to SELECT. But there is no record yet.
    // Let's use service_role to INSERT a record for this user, then try to SELECT it as the user.

    const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY)

    const { error: insertError } = await supabaseAdmin
        .from('providers')
        .insert({
            user_id: userId,
            business_name: 'Test Business',
            business_address: '123 Test St',
            business_category_id: 'd3f2a1b4-c5e6-4f7g-8h9i-0j1k2l3m4n5o', // Dummy UUID, might fail FK but let's see
            // We need a valid category ID. Let's fetch one first.
        })
    // Actually, let's just try to SELECT * from providers. If RLS is on, we should get empty list or error.

    // Let's just try to select ANY provider.
    const { data: providers, error: selectError } = await supabase
        .from('providers')
        .select('*')
        .limit(1)

    if (selectError) {
        console.log('SELECT Error (Expected if RLS denies):', selectError)
    } else {
        console.log('SELECT Success:', providers)
        if (providers.length === 0) console.log('Got 0 providers. RLS might be filtering rows.')
    }

    // Clean up test user
    await supabaseAdmin.auth.admin.deleteUser(userId)
    console.log('Test user deleted.')
}

main()
