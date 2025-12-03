const { Client } = require('pg');

// Connection string from mcp.json
const connectionString = 'postgresql://postgres:Dvvnl%401991@db.xowsvzjvevzpqloniwtf.supabase.co:5432/postgres';

async function fixRealtimePublication() {
    const client = new Client({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        // Check if bookings is in the publication
        const { rows } = await client.query(`
      SELECT * FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND tablename = 'bookings'
    `);

        if (rows.length > 0) {
            console.log('✅ Bookings table is already in supabase_realtime publication');
            console.log('📊 Publication details:', rows[0]);
        } else {
            console.log('❌ Bookings table NOT in supabase_realtime publication');
            console.log('📝 Adding bookings to publication...');

            await client.query(`
        ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
      `);

            console.log('✅ Successfully added bookings to realtime publication!');
        }

        // Verify all tables in publication
        const { rows: allTables } = await client.query(`
      SELECT tablename FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime'
      ORDER BY tablename
    `);

        console.log('\n📋 All tables in supabase_realtime publication:');
        allTables.forEach(t => console.log('  -', t.tablename));

    } catch (err) {
        console.error('❌ Error:', err.message);
        console.error('Details:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

fixRealtimePublication();
