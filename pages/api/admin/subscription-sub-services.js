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

    if (req.method === 'POST') {
      const { service_id, name, description, unit, price } = req.body;

      const { data, error } = await supabaseAdmin
        .from('subscription_sub_services')
        .insert({ service_id, name, description, unit, price })
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({ success: true, sub_service: data });
    }

    if (req.method === 'GET') {
      const { service_id } = req.query;

      const { data, error } = await supabaseAdmin
        .from('subscription_sub_services')
        .select('*')
        .eq('service_id', service_id)
        .eq('is_active', true);

      if (error) throw error;

      return res.status(200).json({ success: true, sub_services: data });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Sub-services error:', error);
    res.status(500).json({ error: error.message });
  }
}
