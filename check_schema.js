
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
    console.log('Checking provider_services schema...');
    // Try to select 'unit'
    const { data: d1, error: e1 } = await supabase.from('provider_services').select('unit').limit(1);
    if (e1) console.log('Error selecting unit:', e1.message);
    else console.log('Success selecting unit. Column exists.');

    // Check if there is a metadata column
    const { data: d2, error: e2 } = await supabase.from('provider_services').select('metadata').limit(1);
    if (e2) console.log('Error selecting metadata:', e2.message);
    else console.log('Success selecting metadata. Column exists.');

    // Check all columns for a row
    const { data: d3, error: e3 } = await supabase.from('provider_services').select('*').limit(1);
    if (d3 && d3.length > 0) console.log('Row keys:', Object.keys(d3[0]));
}

check();
