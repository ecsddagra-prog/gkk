require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  try {
    await client.connect();
    console.log('Connected to database...');
    
    const sql = fs.readFileSync('./supabase/migrations/20251208_subscription_system.sql', 'utf8');
    
    console.log('Running migration...');
    await client.query(sql);
    
    console.log('Migration completed successfully ✔️');
  } catch (error) {
    console.error('Migration failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await client.end();
  }
}

migrate();
