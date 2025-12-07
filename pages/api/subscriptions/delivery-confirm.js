import { supabase } from '../../../lib/supabase';
import { verifyAuth } from '../../../lib/api-auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await verifyAuth(req);
    const { qr_token, subscription_id, broadcast_id, quantity, amount } = req.body;

    const { data: tokenData } = await supabase
      .from('provider_qr_tokens')
      .select('provider_id, expires_at, is_active')
      .eq('token', qr_token)
      .single();

    if (!tokenData || !tokenData.is_active || new Date(tokenData.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired QR token' });
    }

    const { data, error } = await supabase
      .rpc('record_subscription_delivery', {
        p_subscription_id: subscription_id,
        p_broadcast_id: broadcast_id,
        p_quantity: quantity,
        p_amount: amount
      });

    if (error) throw error;

    res.status(200).json({ success: true, delivery_id: data });
  } catch (error) {
    console.error('Delivery confirmation error:', error);
    res.status(500).json({ error: error.message });
  }
}
