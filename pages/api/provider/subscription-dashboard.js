import { supabase } from '../../../lib/supabase';
import { verifyAuth } from '../../../lib/api-auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await verifyAuth(req);

    const { data: provider } = await supabase
      .from('providers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!provider) {
      return res.status(403).json({ error: 'Provider not found' });
    }

    const { data: broadcasts } = await supabase
      .from('subscription_broadcasts')
      .select('*')
      .eq('provider_id', provider.id)
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: subscribers } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        users:user_id (full_name, phone)
      `)
      .eq('provider_id', provider.id)
      .eq('status', 'active');

    const today = new Date().toISOString().split('T')[0];
    const { data: todayResponses } = await supabase
      .from('subscription_responses')
      .select('response')
      .in('broadcast_id', broadcasts?.map(b => b.id) || [])
      .gte('created_at', today);

    const responseCounts = {
      accepted: todayResponses?.filter(r => r.response === 'accepted').length || 0,
      rejected: todayResponses?.filter(r => r.response === 'rejected').length || 0,
      pending: (subscribers?.length || 0) - (todayResponses?.length || 0)
    };

    const { data: deliveries } = await supabase
      .from('subscription_deliveries')
      .select('amount, delivery_date')
      .eq('provider_id', provider.id)
      .eq('status', 'delivered');

    const analytics = {
      daily: deliveries?.filter(d => d.delivery_date === today).length || 0,
      monthly: deliveries?.length || 0,
      revenue: deliveries?.reduce((sum, d) => sum + parseFloat(d.amount), 0) || 0
    };

    res.status(200).json({
      success: true,
      broadcasts,
      subscribers,
      responses: responseCounts,
      analytics
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
}
