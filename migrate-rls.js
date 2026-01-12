// Direct PostgreSQL migration script - handles existing policies
const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

const DATABASE_URL = 'postgresql://postgres:Dvvnl%401991@db.mugliulilcwmrgxepxcr.supabase.co:5432/postgres'

async function applyMigration() {
    const client = new Client({ connectionString: DATABASE_URL })

    try {
        console.log('📡 Connecting to database...')
        await client.connect()
        console.log('✅ Connected successfully!\n')

        console.log('🚀 Applying RLS fixes...\n')

        // Execute each statement individually to handle errors gracefully
        const statements = [
            // Drop existing users policies
            'DROP POLICY IF EXISTS "Users can view own profile" ON users',
            'DROP POLICY IF EXISTS "Users can insert own profile" ON users',
            'DROP POLICY IF EXISTS "Users can update own profile" ON users',

            // Create users policies
            'CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id)',
            'CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id)',
            'CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id)',

            // Drop existing user_addresses policies
            'DROP POLICY IF EXISTS "Users can manage own addresses" ON user_addresses',
            'DROP POLICY IF EXISTS "Users can view own addresses" ON user_addresses',
            'DROP POLICY IF EXISTS "Users can insert own addresses" ON user_addresses',
            'DROP POLICY IF EXISTS "Users can update own addresses" ON user_addresses',
            'DROP POLICY IF EXISTS "Users can delete own addresses" ON user_addresses',

            // Create user_addresses policies
            'CREATE POLICY "Users can view own addresses" ON user_addresses FOR SELECT USING (user_id = auth.uid())',
            'CREATE POLICY "Users can insert own addresses" ON user_addresses FOR INSERT WITH CHECK (user_id = auth.uid())',
            'CREATE POLICY "Users can update own addresses" ON user_addresses FOR UPDATE USING (user_id = auth.uid())',
            'CREATE POLICY "Users can delete own addresses" ON user_addresses FOR DELETE USING (user_id = auth.uid())'
        ]

        for (const statement of statements) {
            try {
                await client.query(statement)
                const action = statement.includes('DROP') ? '🗑️  Dropped' : '✅ Created'
                const policyName = statement.match(/"([^"]+)"/)?.[1] || 'policy'
                console.log(`${action}: ${policyName}`)
            } catch (err) {
                // Ignore "does not exist" errors for DROP statements
                if (!err.message.includes('does not exist')) {
                    console.log(`⚠️  Warning: ${err.message}`)
                }
            }
        }

        console.log('\n📊 Verifying policies...\n')

        // Verify policies were created
        const verification = await client.query(`
      SELECT tablename, policyname, cmd 
      FROM pg_policies 
      WHERE tablename IN ('users', 'user_addresses') 
      ORDER BY tablename, policyname
    `)

        console.log('✅ Active policies:')
        verification.rows.forEach(row => {
            console.log(`   ${row.tablename}.${row.policyname} [${row.cmd}]`)
        })

        console.log('\n🎉 Migration completed! Signup and address creation should now work.\n')

    } catch (error) {
        console.error('\n❌ Migration failed:', error.message)
        process.exit(1)
    } finally {
        await client.end()
    }
}

applyMigration()
