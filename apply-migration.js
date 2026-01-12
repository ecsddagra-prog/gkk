// Script to apply RLS migration to Supabase
const { supabaseAdmin } = require('./lib/supabase')
const fs = require('fs')
const path = require('path')

async function applyMigration() {
    try {
        console.log('Reading migration file...')
        const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20260112_fix_users_and_addresses_rls.sql')
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

        console.log('Applying migration to database...')

        // Split SQL into individual statements
        const statements = migrationSQL
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'))

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i]
            console.log(`Executing statement ${i + 1}/${statements.length}...`)

            const { error } = await supabaseAdmin.rpc('exec_sql', {
                sql: statement + ';'
            })

            if (error) {
                // Try direct query if RPC doesn't work
                const { error: queryError } = await supabaseAdmin
                    .from('_migration_temp')
                    .select('*')
                    .limit(0)

                // Since we can't execute raw SQL directly, we'll need to use a different approach
                throw new Error('Cannot execute raw SQL through Supabase client. Please apply migration manually through Supabase Dashboard.')
            }
        }

        console.log('✅ Migration applied successfully!')
        process.exit(0)
    } catch (error) {
        console.error('❌ Migration failed:', error.message)
        console.error('\nPlease apply the migration manually:')
        console.error('1. Open Supabase Dashboard')
        console.error('2. Go to SQL Editor')
        console.error('3. Copy content from: supabase/migrations/20260112_fix_users_and_addresses_rls.sql')
        console.error('4. Paste and run in SQL Editor')
        process.exit(1)
    }
}

applyMigration()
