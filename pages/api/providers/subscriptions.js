// Provider subscription offers API
import { supabaseAdmin } from '../../../lib/supabase';
import { requireAuthUser } from '../../../lib/api-auth';

export default async function handler(req, res) {
    if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase admin client not configured' });
    }

    try {
        const user = await requireAuthUser(req);
        // Get provider profile
        const { data: provider, error: providerError } = await supabaseAdmin
            .from('providers')
            .select('id')
            .eq('user_id', user.id)
            .single();
        if (providerError || !provider) {
            return res.status(404).json({ error: 'Provider profile not found' });
        }

        if (req.method === 'GET') {
            // List provider's subscription offers
            const { data, error } = await supabaseAdmin
                .from('subscriptions')
                .select('*')
                .eq('provider_id', provider.id)
                .order('created_at', { ascending: true });
            if (error) throw error;
            return res.status(200).json({ subscriptions: data });
        }

        if (req.method === 'POST') {
            const {
                service_id,
                title,
                description = null,
                price,
                interval,
                active = true,
            } = req.body || {};
            if (!service_id || !title || price === undefined || !interval) {
                return res.status(400).json({ error: 'service_id, title, price, and interval are required' });
            }
            const payload = {
                provider_id: provider.id,
                service_id,
                title: title.trim(),
                description: description?.trim() || null,
                price: Number(price),
                interval,
                active: Boolean(active),
            };
            const { data, error } = await supabaseAdmin
                .from('subscriptions')
                .insert(payload)
                .select()
                .single();
            if (error) throw error;
            return res.status(201).json({ subscription: data });
        }

        if (req.method === 'PUT') {
            const { id, ...updates } = req.body || {};
            if (!id) {
                return res.status(400).json({ error: 'Subscription id is required' });
            }
            // Verify ownership
            const { data: existing, error: fetchError } = await supabaseAdmin
                .from('subscriptions')
                .select('*')
                .eq('id', id)
                .single();
            if (fetchError || !existing) {
                return res.status(404).json({ error: 'Subscription not found' });
            }
            if (existing.provider_id !== provider.id) {
                return res.status(403).json({ error: 'You cannot edit this subscription' });
            }
            const payload = {
                title: updates.title?.trim() || existing.title,
                description: updates.description?.trim() ?? existing.description,
                price: updates.price !== undefined ? Number(updates.price) : existing.price,
                interval: updates.interval || existing.interval,
                active: updates.active !== undefined ? Boolean(updates.active) : existing.active,
            };
            const { data, error } = await supabaseAdmin
                .from('subscriptions')
                .update(payload)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return res.status(200).json({ subscription: data });
        }

        if (req.method === 'DELETE') {
            const { id } = req.body || {};
            if (!id) {
                return res.status(400).json({ error: 'Subscription id is required' });
            }
            const { data: existing, error: fetchError } = await supabaseAdmin
                .from('subscriptions')
                .select('provider_id')
                .eq('id', id)
                .single();
            if (fetchError || !existing) {
                return res.status(404).json({ error: 'Subscription not found' });
            }
            if (existing.provider_id !== provider.id) {
                return res.status(403).json({ error: 'You cannot delete this subscription' });
            }
            // Soft delete by setting active false
            const { error } = await supabaseAdmin
                .from('subscriptions')
                .update({ active: false })
                .eq('id', id);
            if (error) throw error;
            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Provider subscriptions error:', error);
        const status = error.status || 500;
        return res.status(status).json({ error: error.message });
    }
}
