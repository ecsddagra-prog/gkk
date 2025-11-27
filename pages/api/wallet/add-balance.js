import { supabaseAdmin } from '../../../lib/supabase'
import { requireAuthUser } from '../../../lib/api-auth'

export default async function handler(req, res) {
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase admin client not configured' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const user = await requireAuthUser(req)
    const { amount, metadata } = req.body || {}
    const numericAmount = Number(amount)

    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' })
    }

    // Ensure wallet row exists
    const { data: existingWallet } = await supabaseAdmin
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!existingWallet) {
      await supabaseAdmin
        .from('wallets')
        .insert({
          user_id: user.id,
          balance: 0,
          locked_balance: 0
        })
    }

    // Create pending topup (mock payment initiation)
    const { data: topup, error } = await supabaseAdmin
      .from('wallet_topups')
      .insert({
        user_id: user.id,
        amount: numericAmount,
        status: 'pending',
        metadata: metadata || null
      })
      .select()
      .single()

    if (error) throw error

    return res.status(201).json({ topup })
  } catch (error) {
    console.error('Wallet add balance error:', error)
    const status = error.status || 500
    return res.status(status).json({ error: error.message })
  }
}

