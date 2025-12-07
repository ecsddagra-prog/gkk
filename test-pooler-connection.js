const { Client } = require('pg');

// Trying ap-south-1 (Mumbai) as user is in IST timezone
// Username format: postgres.[project-ref]
// Host: aws-0-ap-south-1.pooler.supabase.com
// Port: 6543
// Database: postgres

const connectionString = "postgresql://postgres.mugliulilcwmrgxepxcr:Dvvnl%401991@aws-0-ap-south-1.pooler.supabase.com:6543/postgres";

const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000 // 10 seconds
});

async function test() {
    console.log('Testing connection to Supavisor Pooler (ap-south-1)...');
    console.log('URL:', connectionString.replace(':Dvvnl%401991', ':****'));

    try {
        await client.connect();
        console.log('✅ Connected successfully to Pooler!');
        await client.end();
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        if (err.message.includes('getaddrinfo')) {
            console.log('Hint: Hostname might be wrong (wrong region?).');
        }
        if (err.message.includes('password')) {
            console.log('Hint: Password or Username might be wrong.');
        }
    }
}

test();
