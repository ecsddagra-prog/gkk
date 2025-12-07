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
  const sqlFile = process.argv[2];
  if (!sqlFile) {
    console.error('Please provide a SQL file path');
    process.exit(1);
  }

  const sqlPath = path.join(__dirname, sqlFile);
  if (!fs.existsSync(sqlPath)) {
    console.error('SQL file not found:', sqlPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');

  try {
    let connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      console.error('DATABASE_URL not found in .env.local');
      return;
    }

    const client = new Client({
      connectionString: connectionString,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();
    // Split by semicolons and run loosely if needed, or just run the whole block?
    // pg client can usually handle multiple statements if they are simple.
    // However, some PL/pgSQL blocks might cause issues if split incorrectly.
    // Let's try running it as one block first.
    await client.query(sql);
    await client.end();
    console.log('SQL executed successfully');

  } catch (e) {
    console.error('Error executing SQL:', e);
  }
}

runSql();
