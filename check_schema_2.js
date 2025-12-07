
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
let envConfig = '';
if (fs.existsSync(envPath)) {
    envConfig = fs.readFileSync(envPath, 'utf8');
}
envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) process.env[key.trim()] = value.trim();
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('Checking service_subservices schema...');
    const { data: d1, error: e1 } = await supabase.from('service_subservices').select('*').limit(1);

    if (d1 && d1.length > 0) {
        console.log('service_subservices keys:', Object.keys(d1[0]));
        console.log('Sample row:', d1[0]);
    } else {
        console.log('No subservices found or error:', e1?.message);
    }

    console.log('Checking services schema...');
    const { data: d2, error: e2 } = await supabase.from('services').select('*').limit(1);
    if (d2 && d2.length > 0) {
        console.log('services keys:', Object.keys(d2[0]));
    }
}

check();
