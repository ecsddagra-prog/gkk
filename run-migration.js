const fs = require('fs');
const path = require('path');

async function runMigration() {
  const migrationFile = path.join(__dirname, 'supabase/migrations/20251208_subscription_system.sql');
  const sql = fs.readFileSync(migrationFile, 'utf8');

  console.log('Running migration...');
  console.log('\nPlease run this SQL in Supabase Dashboard SQL Editor:\n');
  console.log('1. Go to: https://supabase.com/dashboard/project/mugliulilcwmrgxepxcr/sql/new');
  console.log('2. Copy the SQL from: supabase/migrations/20251208_subscription_system.sql');
  console.log('3. Execute it\n');
  console.log('Migration file ready ✔️');
}

runMigration();
