import { supabaseAdmin } from '../../../lib/supabase'
import { requireAuthUser } from '../../../lib/api-auth'

async function getProvider(userId) {
  const { data, error } = await supabaseAdmin
    .from('providers')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    const err = new Error('Provider profile not found')
    err.status = 404
    throw err
  }

  return data
}

export default async function handler(req, res) {
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase admin client not configured' })
  }

  try {
    const user = await requireAuthUser(req)
    const provider = await getProvider(user.id)

    if (req.method === 'GET') {
      const { data, error } = await supabaseAdmin
        .from('provider_documents')
        .select('*')
        .eq('provider_id', provider.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return res.status(200).json({ documents: data || [] })
    }

    if (req.method === 'POST') {
      const { doc_type, metadata, file_url } = req.body || {}

      if (!doc_type) {
        return res.status(400).json({ error: 'doc_type is required' })
      }

      const { data: document, error } = await supabaseAdmin
        .from('provider_documents')
        .upsert({
          provider_id: provider.id,
          doc_type,
          metadata: metadata || null,
          file_url: file_url || null,
          status: 'pending'
        }, { onConflict: 'provider_id,doc_type' })
        .select()
        .single()

      if (error) throw error
      return res.status(200).json({ document })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Provider documents API error:', error)
    const status = error.status || 500
    return res.status(status).json({ error: error.message })
  }
}

