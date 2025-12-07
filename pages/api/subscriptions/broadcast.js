import { supabase } from '../../../lib/supabase';
import { verifyAuth } from '../../../lib/api-auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await verifyAuth(req);
    const { service_id, title, description, images, expires_at } = req.body;

    const { data: provider } = await supabase
      .from('providers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!provider) {
      return res.status(403).json({ error: 'Provider not found' });
    }

    const { data, error } = await supabase
      .from('subscription_broadcasts')
      .insert({
        provider_id: provider.id,
        service_id,
        title,
        description,
        images: images || [],
        expires_at: expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ success: true, broadcast: data });
  } catch (error) {
    console.error('Broadcast error:', error);
    res.status(500).json({ error: error.message });
  }
}
