require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Testing Realtime Connection...\n')
console.log('Supabase URL:', supabaseUrl)
console.log('Key present:', !!supabaseKey)

const supabase = createClient(supabaseUrl, supabaseKey, {
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    }
})

// Test subscription
console.log('\n📡 Attempting to subscribe to bookings channel...')

const channel = supabase
    .channel('test-bookings-realtime')
    .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings'
    }, (payload) => {
        console.log('✅ Received change:', payload)
    })
    .subscribe((status, error) => {
        console.log('\n📊 Subscription Status:', status)

        if (error) {
            console.error('❌ Subscription Error:', error)
        }

        if (status === 'SUBSCRIBED') {
            console.log('✅ Successfully subscribed to bookings realtime!')
            console.log('\n💡 Realtime is working! The CHANNEL_ERROR might be due to:')
            console.log('   1. Browser-specific issue')
            console.log('   2. Websocket connection blocked')
            console.log('   3. Try hard refresh (Ctrl+Shift+R)')

            setTimeout(() => {
                console.log('\n🛑 Disconnecting...')
                supabase.removeChannel(channel)
                process.exit(0)
            }, 3000)
        } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ CHANNEL_ERROR detected!')
            console.error('Possible causes:')
            console.error('   1. Realtime not enabled in Supabase Dashboard')
            console.error('   2. Table not in publication (we verified it is)')
            console.error('   3. RLS blocking realtime (we fixed this)')
            console.error('   4. Network/firewall issue')
            console.error('\n🔗 Check: https://supabase.com/dashboard/project/xowsvzjvevzpqloniwtf/settings/api')
            console.error('Ensure "Enable Realtime" is ON under Database settings')

            supabase.removeChannel(channel)
            process.exit(1)
        }
    })

// Handle timeout
setTimeout(() => {
    console.log('\n⏱️  Timeout - subscription did not complete')
    supabase.removeChannel(channel)
    process.exit(1)
}, 10000)
