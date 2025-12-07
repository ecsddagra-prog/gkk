const { Client } = require('pg');

const connectionString = "postgresql://postgres:Dvvnl%401991@db.mugliulilcwmrgxepxcr.supabase.co:5432/postgres";

const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function test() {
    try {
        await client.connect();
        console.log('Connected successfully!');
        await client.end();
    } catch (err) {
        console.error('Connection failed:', err.message);
    }
}

test();
