
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkColumn() {
    console.log('🔍 Checking for "for_whom" column in "bookings" table...')

    try {
        // Try to select the column. If it doesn't exist, this should throw or return an error.
        const { data, error } = await supabase
            .from('bookings')
            .select('for_whom')
            .limit(1)

        if (error) {
            console.error('❌ Error selecting column:', error.message)
            if (error.message.includes('column') && error.message.includes('does not exist')) {
                console.log('⚠️ CONFIRMED: Column "for_whom" is missing.')
            } else if (error.message.includes('Could not find the')) {
                console.log('⚠️ CONFIRMED: Column "for_whom" is missing (Schema Cache Error).')
            }
            return false
        }

        console.log('✅ Column "for_whom" exists!')
        return true
    } catch (err) {
        console.error('❌ Unexpected error:', err.message)
        return false
    }
}

checkColumn()
