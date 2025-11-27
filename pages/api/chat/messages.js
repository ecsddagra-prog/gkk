import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase admin client not configured' })
  }

  if (req.method === 'GET') {
    try {
      const { booking_id } = req.query

      if (!booking_id) {
        return res.status(400).json({ error: 'Booking ID is required' })
      }

      const { data: messages, error } = await supabaseAdmin
        .from('chat_messages')
        .select('*, sender:users!sender_id(id, full_name), receiver:users!receiver_id(id, full_name)')
        .eq('booking_id', booking_id)
        .order('created_at', { ascending: true })

      if (error) throw error

      return res.status(200).json({ messages })
    } catch (error) {
      console.error('Get messages error:', error)
      return res.status(500).json({ error: error.message })
    }
  }

  if (req.method === 'POST') {
    try {
      const { booking_id, sender_id, receiver_id, message } = req.body

      if (!booking_id || !sender_id || !receiver_id || !message) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      const { data: chatMessage, error } = await supabaseAdmin
        .from('chat_messages')
        .insert({
          booking_id,
          sender_id,
          receiver_id,
          message
        })
        .select('*, sender:users!sender_id(id, full_name), receiver:users!receiver_id(id, full_name)')
        .single()

      if (error) throw error

      // Create notification for receiver
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: receiver_id,
          title: 'New Message',
          message: `You have a new message regarding booking #${booking_id}`,
          type: 'chat',
          reference_id: booking_id
        })

      return res.status(201).json({ message: chatMessage })
    } catch (error) {
      console.error('Send message error:', error)
      return res.status(500).json({ error: error.message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

