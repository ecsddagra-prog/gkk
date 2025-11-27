import { supabaseAdmin } from '../../../lib/supabase'

const WEBHOOK_SECRET = process.env.WALLET_WEBHOOK_SECRET || null

export default async function handler(req, res) {
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase admin client not configured' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (WEBHOOK_SECRET) {
    const headerSecret = req.headers['x-webhook-secret']
    if (headerSecret !== WEBHOOK_SECRET) {
      return res.status(401).json({ error: 'Invalid webhook secret' })
    }
  }

  try {
    const { topup_id, status = 'success', reference_id } = req.body || {}

    if (!topup_id) {
      return res.status(400).json({ error: 'topup_id is required' })
    }

    const { data: topup, error: topupError } = await supabaseAdmin
      .from('wallet_topups')
      .select('*')
      .eq('id', topup_id)
      .single()

    if (topupError || !topup) {
      return res.status(404).json({ error: 'Top-up not found' })
    }

    if (topup.status !== 'pending') {
      return res.status(400).json({ error: 'Top-up already processed' })
    }

    if (status === 'failed') {
      await supabaseAdmin
        .from('wallet_topups')
        .update({ status: 'failed', reference_id: reference_id || null })
        .eq('id', topup_id)

      return res.status(200).json({ message: 'Top-up marked as failed' })
    }

    const { data: wallet } = await supabaseAdmin
      .from('wallets')
      .select('*')
      .eq('user_id', topup.user_id)
      .single()

    let walletId = wallet?.id
    let currentBalance = Number(wallet?.balance || 0)

    if (!wallet) {
      const { data: newWallet } = await supabaseAdmin
        .from('wallets')
        .insert({
          user_id: topup.user_id,
          balance: 0,
          locked_balance: 0
        })
        .select()
        .single()

      walletId = newWallet.id
      currentBalance = 0
    }

    const newBalance = currentBalance + Number(topup.amount)

    await supabaseAdmin
      .from('wallets')
      .update({ balance: newBalance })
      .eq('id', walletId)

    await supabaseAdmin
      .from('users')
      .update({ wallet_balance: newBalance })
      .eq('id', topup.user_id)

    await supabaseAdmin
      .from('wallet_transactions')
      .insert({
        user_id: topup.user_id,
        wallet_id: walletId,
        amount: topup.amount,
        transaction_type: 'credit',
        description: `Wallet top-up ${reference_id || ''}`.trim(),
        balance_after: newBalance
      })

    await supabaseAdmin
      .from('wallet_topups')
      .update({ status: 'success', reference_id: reference_id || null })
      .eq('id', topup_id)

    return res.status(200).json({ 
      message: 'Wallet balance updated',
      balance: newBalance 
    })
  } catch (error) {
    console.error('Wallet webhook error:', error)
    return res.status(500).json({ error: error.message })
  }
}

