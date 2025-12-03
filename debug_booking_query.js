
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually load .env.local
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Using service role to bypass RLS for debugging, but we should also test with anon if possible, but anon needs auth.
// Actually, if it fails with service role, it's definitely a schema/query issue.

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugQuery() {
    // Get a valid booking ID first
    const { data: bookings, error: bookingError } = await supabase
        .from('bookings')
        .select('id')
        .limit(1);

    if (bookingError || !bookings || bookings.length === 0) {
        console.error('Could not find any booking to test with.');
        return;
    }

    const bookingId = bookings[0].id;
    console.log(`Testing with Booking ID: ${bookingId}`);

    // Try the query that is failing
    console.log('Running query with history join...');
    const { data, error } = await supabase
        .from('bookings')
        .select(`
      *,
      history:booking_status_history(*)
    `)
        .eq('id', bookingId)
        .single();

    if (error) {
        console.error('❌ Query failed:', error);
    } else {
        console.log('✅ Query successful:', data);
    }
}

debugQuery();
