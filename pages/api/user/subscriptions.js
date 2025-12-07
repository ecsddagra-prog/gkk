import { supabase } from '../../../lib/supabase';
import { verifyAuth } from '../../../lib/api-auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await verifyAuth(req);

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        services:service_id (name),
        providers:provider_id (business_name, users:user_id (full_name))
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const subscriptions = data.map(sub => ({
      ...sub,
      service_name: sub.services?.name,
      provider_name: sub.providers?.business_name || sub.providers?.users?.full_name
    }));

    res.status(200).json({ success: true, subscriptions });
  } catch (error) {
    console.error('Subscriptions error:', error);
    res.status(500).json({ error: error.message });
  }
}
