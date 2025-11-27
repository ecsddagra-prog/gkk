import { supabaseAdmin } from '../../../lib/supabase'
import { requireProviderUser } from '../../../lib/api-auth'

export default async function handler(req, res) {
    try {
        const { provider } = await requireProviderUser(req)

        if (req.method === 'GET') {
            return res.status(200).json({
                travel_charge_type: provider.travel_charge_type,
                travel_charge_amount: provider.travel_charge_amount,
                free_travel_radius_km: provider.free_travel_radius_km,
                enable_travel_charges: provider.enable_travel_charges,
                enable_rental_charges: provider.enable_rental_charges,
                gst_enabled: provider.gst_enabled,
                gst_percentage: provider.gst_percentage
            })
        }

        if (req.method === 'PUT') {
            const {
                travel_charge_type,
                travel_charge_amount,
                free_travel_radius_km,
                enable_travel_charges,
                enable_rental_charges,
                gst_enabled,
                gst_percentage
            } = req.body

            const { error } = await supabaseAdmin
                .from('providers')
                .update({
                    travel_charge_type,
                    travel_charge_amount,
                    free_travel_radius_km,
                    enable_travel_charges,
                    enable_rental_charges,
                    gst_enabled,
                    gst_percentage,
                    updated_at: new Date()
                })
                .eq('id', provider.id)

            if (error) throw error

            return res.status(200).json({ success: true })
        }

        res.setHeader('Allow', ['GET', 'PUT'])
        res.status(405).end(`Method ${req.method} Not Allowed`)

    } catch (error) {
        console.error('API Error:', error)
        res.status(error.status || 500).json({ error: error.message })
    }
}
