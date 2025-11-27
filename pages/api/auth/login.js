import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase admin client not configured' })
  }

  try {
    const { email, phone, password } = req.body

    if (!email && !phone) {
      return res.status(400).json({ error: 'Email or phone is required' })
    }
    if (!password) {
      return res.status(400).json({ error: 'Password is required' })
    }

    // Sign in user
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: email || phone,
      password
    })

    if (error) throw error

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError) throw profileError

    return res.status(200).json({
      user: profile,
      session: data.session
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(401).json({ error: error.message })
  }
}

