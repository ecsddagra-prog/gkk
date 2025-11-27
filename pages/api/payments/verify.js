import { supabaseAdmin } from '../../../lib/supabase'
import Razorpay from 'razorpay'
import crypto from 'crypto'

// Initialize Razorpay only if keys are available
let razorpay = null
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase admin client not configured' })
  }

  if (!process.env.RAZORPAY_KEY_SECRET) {
    return res.status(500).json({ error: 'Razorpay key secret not configured' })
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id } = req.body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment details' })
    }

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex')

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' })
    }

    // Get payment record
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .select('*, booking:bookings(*)')
      .eq('razorpay_order_id', razorpay_order_id)
      .single()

    if (paymentError || !payment) {
      return res.status(404).json({ error: 'Payment not found' })
    }

    // Update payment
    await supabaseAdmin
      .from('payments')
      .update({
        payment_status: 'paid',
        razorpay_payment_id,
        razorpay_signature
      })
      .eq('id', payment.id)

    // Update booking
    await supabaseAdmin
      .from('bookings')
      .update({ payment_status: 'paid' })
      .eq('id', payment.booking_id)

    // Add cashback and rewards to wallet
    if (payment.booking) {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', payment.booking.user_id)
        .single()

      if (user && payment.booking.cashback_earned > 0) {
        const newBalance = (user.wallet_balance || 0) + payment.booking.cashback_earned

        await supabaseAdmin
          .from('users')
          .update({
            wallet_balance: newBalance,
            total_cashback: (user.total_cashback || 0) + payment.booking.cashback_earned
          })
          .eq('id', user.id)

        // Create wallet transaction
        await supabaseAdmin
          .from('wallet_transactions')
          .insert({
            user_id: user.id,
            amount: payment.booking.cashback_earned,
            transaction_type: 'cashback',
            booking_id: payment.booking_id,
            description: `Cashback for booking #${payment.booking.booking_number}`,
            balance_after: newBalance
          })

        // Create cashback record
        await supabaseAdmin
          .from('cashback_transactions')
          .insert({
            user_id: user.id,
            booking_id: payment.booking_id,
            amount: payment.booking.cashback_earned,
            percentage: 5, // Default
            expiry_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
          })
      }

      if (payment.booking.rewards_earned > 0) {
        await supabaseAdmin
          .from('reward_transactions')
          .insert({
            user_id: user.id,
            booking_id: payment.booking_id,
            points: payment.booking.rewards_earned,
            expiry_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) // 180 days
          })
      }
    }

    return res.status(200).json({ 
      success: true,
      message: 'Payment verified successfully',
      payment_id: payment.id
    })
  } catch (error) {
    console.error('Verify payment error:', error)
    return res.status(500).json({ error: error.message })
  }
}

