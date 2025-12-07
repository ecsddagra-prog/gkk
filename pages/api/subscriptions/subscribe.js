import { supabase } from '../../../lib/supabase';
import { verifyAuth } from '../../../lib/api-auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await verifyAuth(req);
    const { provider_id, service_id, sub_services, billing_cycle, advance_paid } = req.body;

    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: user.id,
        provider_id,
        service_id,
        sub_services,
        billing_cycle,
        advance_paid: advance_paid || 0,
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;

    if (advance_paid > 0) {
      await supabase.from('subscription_ledger').insert({
        subscription_id: data.id,
        user_id: user.id,
        provider_id,
        transaction_type: 'advance',
        amount: advance_paid,
        balance_after: advance_paid,
        description: 'Advance payment'
      });
    }

    res.status(200).json({ success: true, subscription: data });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: error.message });
  }
}
