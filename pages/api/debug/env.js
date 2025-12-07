export default function handler(req, res) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

    const info = {
        serviceKeyPresent: !!serviceKey,
        anonKeyPresent: !!anonKey,
        serviceKeyLength: serviceKey.length,
        anonKeyLength: anonKey.length,
        keysIdentical: serviceKey === anonKey,
        serviceKeyStart: serviceKey.substring(0, 10),
        anonKeyStart: anonKey.substring(0, 10),
        supabaseUrl: supabaseUrl
    }

    console.log('Env Debug:', info)
    res.status(200).json(info)
}
