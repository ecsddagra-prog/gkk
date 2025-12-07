import { supabase } from '../../../lib/supabase';
import { verifyAuth } from '../../../lib/api-auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await verifyAuth(req);
    const { subscription_id } = req.query;

    const { data, error } = await supabase
      .from('subscription_ledger')
      .select('*')
      .eq('subscription_id', subscription_id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const balance = data.length > 0 ? data[0].balance_after : 0;

    res.status(200).json({ success: true, ledger: data, current_balance: balance });
  } catch (error) {
    console.error('Ledger error:', error);
    res.status(500).json({ error: error.message });
  }
}
