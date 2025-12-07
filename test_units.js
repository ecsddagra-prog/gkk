const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log('Testing GET units...');
    const { data: units, error } = await supabase
        .from('service_units')
        .select('*')
        .eq('is_active', true)
        .order('name');

    if (error) {
        console.error('GET error:', error);
    } else {
        console.log('Units found:', units.length);
        units.forEach(u => console.log(' -', u.name));
    }

    console.log('\nTesting Create Unit...');
    const testName = 'Test Unit ' + Date.now();
    const { data: newUnit, error: createError } = await supabase
        .from('service_units')
        .insert({ name: testName })
        .select()
        .single();

    if (createError) {
        console.error('Create error:', createError);
    } else {
        console.log('Created unit:', newUnit.name);

        // Cleanup
        await supabase.from('service_units').delete().eq('id', newUnit.id);
        console.log('Cleanup done.');
    }
}

test();
