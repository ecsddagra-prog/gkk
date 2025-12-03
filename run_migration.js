```
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Manually load .env.local
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  console.log('Current directory:', __dirname);
  console.log('Env file exists:', fs.existsSync(envPath));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSql() {
  const sqlPath = path.join(__dirname, 'create_history_table.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  try {
    // Try to get connection string from env
    let connectionString = process.env.DATABASE_URL;
    
    // If not found, try to construct it (this is a guess, but often works for Supabase)
    // postgres://postgres:[password]@db.[ref].supabase.co:5432/postgres
    // We don't have password easily available usually.
    
    if (!connectionString) {
        console.error('DATABASE_URL not found in .env.local');
        // Fallback: try to use supabase-js to insert a dummy row to a non-existent table to see if we can trigger error or something?
        // No, we need to create table.
        return;
    }

    const client = new Client({
      connectionString: connectionString,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();
    await client.query(sql);
    await client.end();
    console.log('SQL executed successfully');
    
  } catch (e) {
      console.error('Error executing SQL:', e);
  }
}

runSql();
```
