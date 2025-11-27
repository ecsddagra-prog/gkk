import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'

export default function PricingSettings() {
    const [loading, setLoading] = useState(true)
    const [settings, setSettings] = useState({
        travel_charge_type: 'per_km',
        travel_charge_amount: 0,
        free_travel_radius_km: 0,
        enable_travel_charges: false,
        enable_rental_charges: false,
        gst_enabled: false,
        gst_percentage: 18
    })

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const response = await axios.get('/api/provider/pricing', {
                headers: { Authorization: `Bearer ${session?.access_token}` }
            })
            setSettings(response.data)
        } catch (error) {
            console.error('Error fetching pricing settings:', error)
            toast.error('Failed to load pricing settings')
        } finally {
            setLoading(false)
        }
    }

    const handleUpdate = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            await axios.put('/api/provider/pricing', settings, {
                headers: { Authorization: `Bearer ${session?.access_token}` }
            })
            toast.success('Pricing settings updated')
        } catch (error) {
            console.error('Error updating settings:', error)
            toast.error('Failed to update settings')
        }
    }

    if (loading) return <div className="p-4">Loading settings...</div>

    return (
        <div className="max-w-2xl space-y-8">
            {/* Travel Charges */}
            <div className="bg-white p-6 rounded-lg shadow space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Travel Charges</h3>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={settings.enable_travel_charges}
                            onChange={(e) => setSettings({ ...settings, enable_travel_charges: e.target.checked })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">Enable</label>
                    </div>
                </div>

                {settings.enable_travel_charges && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Charge Type</label>
                            <select
                                value={settings.travel_charge_type}
                                onChange={(e) => setSettings({ ...settings, travel_charge_type: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="per_km">Per KM</option>
                                <option value="fixed">Fixed Fee</option>
                                <option value="slab">Slab Based (Coming Soon)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Amount (₹) {settings.travel_charge_type === 'per_km' ? '/ km' : ''}
                            </label>
                            <input
                                type="number"
                                value={settings.travel_charge_amount}
                                onChange={(e) => setSettings({ ...settings, travel_charge_amount: parseFloat(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Free Radius (km)</label>
                            <input
                                type="number"
                                value={settings.free_travel_radius_km}
                                onChange={(e) => setSettings({ ...settings, free_travel_radius_km: parseFloat(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g. First 3 km free"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* GST & Taxes */}
            <div className="bg-white p-6 rounded-lg shadow space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">GST & Taxes</h3>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={settings.gst_enabled}
                            onChange={(e) => setSettings({ ...settings, gst_enabled: e.target.checked })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">Enable GST</label>
                    </div>
                </div>

                {settings.gst_enabled && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">GST Percentage (%)</label>
                        <input
                            type="number"
                            value={settings.gst_percentage}
                            onChange={(e) => setSettings({ ...settings, gst_percentage: parseFloat(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                )}
            </div>

            {/* Rental Charges */}
            <div className="bg-white p-6 rounded-lg shadow space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Rental / Tool Charges</h3>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={settings.enable_rental_charges}
                            onChange={(e) => setSettings({ ...settings, enable_rental_charges: e.target.checked })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">Enable Extra Tool Charges</label>
                    </div>
                </div>
                <p className="text-sm text-gray-500">
                    If enabled, you can add specific rental charges to the final bill during job completion.
                </p>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleUpdate}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                    Save Configuration
                </button>
            </div>
        </div>
    )
}
