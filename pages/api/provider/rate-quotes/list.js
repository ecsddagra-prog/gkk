import { supabaseAdmin } from '../../../../lib/supabase'

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
        return res.status(401).json({ error: 'Missing authorization token' })
    }

    try {
        // Verify user
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        // Get provider profile
        const { data: provider, error: providerError } = await supabaseAdmin
            .from('providers')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (providerError || !provider) {
            return res.status(403).json({ error: 'Provider profile not found' })
        }

        // Get provider's active services
        const { data: myServices } = await supabaseAdmin
            .from('provider_services')
            .select('service_id')
            .eq('provider_id', provider.id)
            .eq('is_active', true)

        const serviceIds = myServices?.map(s => s.service_id) || []

        if (serviceIds.length === 0) {
            return res.status(200).json({ rate_quotes: [] })
        }

        // Fetch active rate quotes for these services
        const { data: rateQuotes, error: rateQuotesError } = await supabaseAdmin
            .from('rate_quotes')
            .select(`
                *,
                service:services(*),
                user:users(id, full_name, phone),
                provider_quotes(id, provider_id, quoted_price, status, message, created_at)
            `)
            .in('service_id', serviceIds)
            .in('status', ['open', 'matched', 'converted'])
            .order('created_at', { ascending: false })

        if (rateQuotesError) {
            throw rateQuotesError
        }

        // Filter and enhance with my quote info
        const enhancedQuotes = (rateQuotes || []).map(rq => {
            const myQuote = rq.provider_quotes?.find(pq => pq.provider_id === provider.id)
            return {
                ...rq,
                my_quote: myQuote || null,
                has_responded: !!myQuote
            }
        })

        return res.status(200).json({ rate_quotes: enhancedQuotes })

    } catch (error) {
        console.error('Error fetching provider rate quotes:', error)
        return res.status(500).json({ error: error.message })
    }
}
