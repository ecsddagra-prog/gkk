const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Connection string from mcp.json
const connectionString = 'postgresql://postgres:Dvvnl%401991@db.xowsvzjvevzpqloniwtf.supabase.co:5432/postgres';

async function applyMigration() {
    const client = new Client({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        const migrationPath = path.join(__dirname, '../supabase/migrations/20251203_enable_realtime_bookings.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('📝 Applying realtime migration...');
        await client.query(sql);

        console.log('✅ Realtime enabled for bookings successfully!');
    } catch (err) {
        console.error('❌ Error applying migration:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

applyMigration();
