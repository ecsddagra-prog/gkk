import { createClient } from '@supabase/supabase-js';
import { verifyAuth } from '../../../lib/api-auth';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    const user = await verifyAuth(req);

    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || !['admin', 'superadmin'].includes(userData.role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (req.method === 'PUT') {
      const { service_id, is_subscription_enabled, subscription_config } = req.body;

      const { data, error } = await supabaseAdmin
        .from('services')
        .update({
          is_subscription_enabled,
          subscription_config
        })
        .eq('id', service_id)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({ success: true, service: data });
    }

    if (req.method === 'GET') {
      const { data, error } = await supabaseAdmin
        .from('services')
        .select('id, name, is_subscription_enabled, subscription_config')
        .eq('is_subscription_enabled', true);

      if (error) throw error;

      return res.status(200).json({ success: true, services: data });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Subscription config error:', error);
    res.status(500).json({ error: error.message });
  }
}
