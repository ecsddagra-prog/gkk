const { Client } = require('pg');

const projectRef = 'mugliulilcwmrgxepxcr';
const password = 'Dvvnl%401991';
const db = 'postgres';

const regions = [
    'aws-0-us-east-1',
    'aws-0-eu-central-1',
    'aws-0-ap-southeast-1',
    'aws-0-us-west-1',
    'aws-0-sa-east-1',
];

async function testRegion(region) {
    const host = `${region}.pooler.supabase.com`;
    const connectionString = `postgresql://postgres.${projectRef}:${password}@${host}:6543/${db}`;

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000
    });

    try {
        console.log(`Testing ${region}...`);
        await client.connect();
        console.log(`✅ SUCCESS: Connected to ${region}!`);
        await client.end();
        return region;
    } catch (err) {
        // console.log(`❌ Failed ${region}: ${err.message}`);
        return null;
    }
}

async function run() {
    console.log('Testing regions...');
    for (const region of regions) {
        const result = await testRegion(region);
        if (result) {
            console.log(`\n🎉 Found correct region: ${result}`);
            process.exit(0);
        }
    }
    console.log('\n❌ Could not connect to any common region.');
}

run();
