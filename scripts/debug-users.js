const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error(JSON.stringify({ error: 'Missing Supabase credentials' }))
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function main() {
    const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, email, phone, role, full_name')
        .order('created_at', { ascending: false })
        .limit(5)

    if (usersError) {
        console.error(JSON.stringify({ error: usersError }))
        return
    }

    const results = []

    for (const user of users) {
        const { data: provider, error: providerError } = await supabase
            .from('providers')
            .select('id, business_name, is_verified')
            .eq('user_id', user.id)
            .single()

        results.push({
            user: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                role: user.role,
                full_name: user.full_name
            },
            provider: provider || null
        })
    }

    const fs = require('fs')
    fs.writeFileSync('debug_output.json', JSON.stringify(results, null, 2), 'utf8')
    console.log('Output written to debug_output.json')
}

main()
