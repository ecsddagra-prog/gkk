const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Dvvnl%401991@db.xowsvzjvevzpqloniwtf.supabase.co:5432/postgres';

async function checkBookingStatus() {
    const client = new Client({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('✅ Connected to database\n');

        // Check enum values
        const { rows } = await client.query(`
      SELECT e.enumlabel as enum_value
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      WHERE t.typname = 'booking_status'
      ORDER BY e.enumsortorder;
    `);

        console.log('Valid booking_status values:');
        rows.forEach(r => console.log('  -', r.enum_value));

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

checkBookingStatus();
