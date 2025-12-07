const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  console.log('Parsing DATABASE_URL...');
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is missing');
    return;
  }

  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 5000 // 5 seconds timeout
  });

  try {
    await client.connect();
    console.log('Connected to database');
    console.log('DB URL:', process.env.DATABASE_URL ? 'Found' : 'Not Found');

    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20251207_fix_city_services_rls.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Running migration SQL:', sql);
    await client.query(sql);
    console.log('Migration applied successfully!');

  } catch (err) {
    console.error('Error running migration:', err);
  } finally {
    await client.end();
  }
}

runMigration();
