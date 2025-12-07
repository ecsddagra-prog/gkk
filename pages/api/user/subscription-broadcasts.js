import { supabase } from '../../../lib/supabase';
import { verifyAuth } from '../../../lib/api-auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await verifyAuth(req);

    const { data: subscriptions } = await supabase
      .from('user_subscriptions')
      .select('id, provider_id')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (!subscriptions || subscriptions.length === 0) {
      return res.status(200).json({ success: true, broadcasts: [] });
    }

    const providerIds = subscriptions.map(s => s.provider_id);

    const { data: broadcasts, error } = await supabase
      .from('subscription_broadcasts')
      .select(`
        *,
        subscription_responses!left (response, quantity)
      `)
      .in('provider_id', providerIds)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;

    const broadcastsWithSubscription = broadcasts.map(b => {
      const sub = subscriptions.find(s => s.provider_id === b.provider_id);
      return { ...b, subscription_id: sub?.id };
    });

    res.status(200).json({ success: true, broadcasts: broadcastsWithSubscription });
  } catch (error) {
    console.error('Broadcasts error:', error);
    res.status(500).json({ error: error.message });
  }
}
