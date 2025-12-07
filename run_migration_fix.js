const { Client } = require('pg')

const client = new Client({
  connectionString: 'postgresql://postgres:Dvvnl%401991@db.mugliulilcwmrgxepxcr.supabase.co:5432/postgres'
})

async function migrate() {
  await client.connect()

  const queries = [
    'DROP POLICY IF EXISTS "Users can manage own addresses" ON user_addresses',
    'CREATE POLICY "Users can view own addresses" ON user_addresses FOR SELECT USING (user_id = auth.uid())',
    'CREATE POLICY "Users can insert own addresses" ON user_addresses FOR INSERT WITH CHECK (user_id = auth.uid())',
    'CREATE POLICY "Users can update own addresses" ON user_addresses FOR UPDATE USING (user_id = auth.uid())',
    'CREATE POLICY "Users can delete own addresses" ON user_addresses FOR DELETE USING (user_id = auth.uid())'
  ]

  for (const query of queries) {
    try {
      await client.query(query)
      console.log('✅', query.substring(0, 50))
    } catch (err) {
      console.error('❌', err.message)
    }
  }

  await client.end()
  console.log('\n✅ Migration completed')
}

migrate()
