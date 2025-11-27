import { supabaseAdmin } from '../../../lib/supabase'
import Razorpay from 'razorpay'

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

  if (!razorpay) {
    return res.status(500).json({ error: 'Razorpay not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET' })
  }

  try {
    const { booking_id, amount, wallet_used = 0 } = req.body

    if (!booking_id || !amount) {
      return res.status(400).json({ error: 'Booking ID and amount are required' })
    }

    // Get booking
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select('*, user:users(*)')
      .eq('id', booking_id)
      .single()

    if (bookingError || !booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    const finalAmount = Math.max(0, amount - wallet_used) // Amount after wallet deduction

    if (finalAmount <= 0) {
      // Full payment via wallet
      // Create payment record
      const { data: payment } = await supabaseAdmin
        .from('payments')
        .insert({
          booking_id,
          user_id: booking.user_id,
          amount: amount,
          payment_method: 'wallet',
          payment_status: 'paid',
          transaction_id: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`
        })
        .select()
        .single()

      // Deduct from wallet
      await supabaseAdmin
        .from('users')
        .update({
          wallet_balance: booking.user.wallet_balance - wallet_used
        })
        .eq('id', booking.user_id)

      // Update booking
      await supabaseAdmin
        .from('bookings')
        .update({
          payment_status: 'paid',
          wallet_used: wallet_used
        })
        .eq('id', booking_id)

      return res.status(200).json({ 
        payment,
        message: 'Payment completed via wallet'
      })
    }

    // Create Razorpay order
    const options = {
      amount: finalAmount * 100, // Amount in paise
      currency: 'INR',
      receipt: `booking_${booking_id}_${Date.now()}`,
      notes: {
        booking_id,
        user_id: booking.user_id
      }
    }

    const razorpayOrder = await razorpay.orders.create(options)

    // Create payment record
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        booking_id,
        user_id: booking.user_id,
        amount: amount,
        payment_method: 'razorpay',
        payment_status: 'pending',
        razorpay_order_id: razorpayOrder.id,
        transaction_id: razorpayOrder.id
      })
      .select()
      .single()

    if (paymentError) throw paymentError

    // If wallet is used, deduct it
    if (wallet_used > 0) {
      await supabaseAdmin
        .from('users')
        .update({
          wallet_balance: booking.user.wallet_balance - wallet_used
        })
        .eq('id', booking.user_id)

      await supabaseAdmin
        .from('bookings')
        .update({ wallet_used: wallet_used })
        .eq('id', booking_id)
    }

    return res.status(200).json({
      order: razorpayOrder,
      payment,
      wallet_used
    })
  } catch (error) {
    console.error('Create payment order error:', error)
    return res.status(500).json({ error: error.message })
  }
}

