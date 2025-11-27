import { supabaseAdmin } from '../../../lib/supabase'
import { requireProviderUser } from '../../../lib/api-auth'

export default async function handler(req, res) {
    try {
        const { provider } = await requireProviderUser(req)

        if (req.method === 'GET') {
            return res.status(200).json({
                business_name: provider.business_name,
                short_bio: provider.short_bio,
                experience_years: provider.experience_years,
                past_companies: provider.past_companies,
                is_verified: provider.is_verified
            })
        }

        if (req.method === 'PUT') {
            const { short_bio, experience_years, past_companies } = req.body

            const { error } = await supabaseAdmin
                .from('providers')
                .update({
                    short_bio,
                    experience_years,
                    past_companies,
                    updated_at: new Date()
                })
                .eq('id', provider.id)

            if (error) throw error

            return res.status(200).json({ success: true })
        }

        res.setHeader('Allow', ['GET', 'PUT'])
        res.status(405).end(`Method ${req.method} Not Allowed`)

    } catch (error) {
        console.error('API Error:', error)
        res.status(error.status || 500).json({ error: error.message })
    }
}
