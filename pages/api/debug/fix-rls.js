import { Pool } from 'pg'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
})

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const client = await pool.connect()
        try {
            await client.query('BEGIN')

            // Fix Users RLS
            await client.query(`
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
        CREATE POLICY "Enable insert for authenticated users only" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
        
        DROP POLICY IF EXISTS "Enable insert for service role" ON public.users;
        CREATE POLICY "Enable insert for service role" ON public.users FOR INSERT TO service_role WITH CHECK (true);

        -- Also fix city_services if not already fixed
        DROP POLICY IF EXISTS "Enable read access for all users" ON public.city_services;
        CREATE POLICY "Enable read access for all users" ON public.city_services FOR SELECT USING (true);
      `)

            await client.query('COMMIT')
            res.status(200).json({ message: 'RLS policies updated successfully' })
        } catch (e) {
            await client.query('ROLLBACK')
            throw e
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Migration error:', error)
        res.status(500).json({ error: error.message })
    }
}
