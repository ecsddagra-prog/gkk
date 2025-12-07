import { supabase } from '../../../lib/supabase';
import { verifyAuth } from '../../../lib/api-auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await verifyAuth(req);
    const { broadcast_id, subscription_id, response, quantity } = req.body;

    const { data, error } = await supabase
      .from('subscription_responses')
      .upsert({
        broadcast_id,
        user_id: user.id,
        subscription_id,
        response,
        quantity: quantity || 1
      }, { onConflict: 'broadcast_id,user_id' })
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ success: true, response: data });
  } catch (error) {
    console.error('Response error:', error);
    res.status(500).json({ error: error.message });
  }
}
