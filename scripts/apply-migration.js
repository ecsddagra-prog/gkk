const { Client } = require('pg')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

async function applyMigration() {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
        console.error('DATABASE_URL is missing in .env.local')
        process.exit(1)
    }

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false } // Required for Supabase/Neon usually
    })

    try {
        await client.connect()
        console.log('Connected to database')

        const migrationFile = path.join(__dirname, '../supabase/migrations/004_fix_provider_rls.sql')
        const sql = fs.readFileSync(migrationFile, 'utf8')

        console.log('Applying migration: 004_fix_provider_rls.sql')
        await client.query(sql)

        console.log('Migration applied successfully!')
    } catch (error) {
        console.error('Migration failed:', error)
    } finally {
        await client.end()
    }
}

applyMigration()
