import { supabaseAdmin } from '../../../lib/supabase'
import { requireProviderUser } from '../../../lib/api-auth'

export default async function handler(req, res) {
    try {
        const { provider } = await requireProviderUser(req)

        if (req.method === 'GET') {
            const { data: portfolio, error } = await supabaseAdmin
                .from('provider_portfolio')
                .select('*')
                .eq('provider_id', provider.id)
                .order('created_at', { ascending: false })

            if (error) throw error

            return res.status(200).json({ portfolio })
        }

        if (req.method === 'POST') {
            const { image_url, description } = req.body

            if (!image_url) {
                return res.status(400).json({ error: 'Image URL is required' })
            }

            const { data, error } = await supabaseAdmin
                .from('provider_portfolio')
                .insert({
                    provider_id: provider.id,
                    image_url,
                    description
                })
                .select()
                .single()

            if (error) throw error

            return res.status(200).json({ success: true, item: data })
        }

        if (req.method === 'DELETE') {
            const { id } = req.query

            if (!id) {
                return res.status(400).json({ error: 'ID is required' })
            }

            const { error } = await supabaseAdmin
                .from('provider_portfolio')
                .delete()
                .eq('id', id)
                .eq('provider_id', provider.id) // Ensure ownership

            if (error) throw error

            return res.status(200).json({ success: true })
        }

        res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
        res.status(405).end(`Method ${req.method} Not Allowed`)

    } catch (error) {
        console.error('API Error:', error)
        res.status(error.status || 500).json({ error: error.message })
    }
}
