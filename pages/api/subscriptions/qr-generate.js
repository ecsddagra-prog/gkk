import { supabase } from '../../../lib/supabase';
import { verifyAuth } from '../../../lib/api-auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
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

    const { data, error } = await supabase
      .rpc('generate_provider_qr_token', { p_provider_id: provider.id });

    if (error) throw error;

    res.status(200).json({ success: true, token: data });
  } catch (error) {
    console.error('QR generation error:', error);
    res.status(500).json({ error: error.message });
  }
}
