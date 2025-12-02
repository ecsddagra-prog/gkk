import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import axios from 'axios'

export default function PaymentSettings() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [settings, setSettings] = useState({
        account_holder_name: '',
        bank_name: '',
        account_number: '',
        ifsc_code: '',
        upi_id: '',
        qr_code_url: '',
        primary_method: 'upi'
    })

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const response = await axios.get('/api/provider/payment-settings', {
                headers: {
                    Authorization: `Bearer ${session.access_token}`
                }
            })

            if (response.data.settings) {
                setSettings(response.data.settings)
            }
        } catch (error) {
            console.error('Error loading settings:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleQRUpload = async (e) => {
        try {
            setUploading(true)
            if (!e.target.files || e.target.files.length === 0) {
                throw new Error('Please select an image to upload')
            }

            const file = e.target.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName)

            setSettings(prev => ({ ...prev, qr_code_url: publicUrl }))
            toast.success('QR code uploaded successfully')
        } catch (error) {
            console.error('Upload error:', error)
            toast.error('Failed to upload QR code')
        } finally {
            setUploading(false)
        }
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) throw new Error('Not authenticated')

            await axios.post('/api/provider/payment-settings', settings, {
                headers: {
                    Authorization: `Bearer ${session.access_token}`
                }
            })

            toast.success('Payment settings saved successfully')
        } catch (error) {
            console.error('Save error:', error)
            toast.error('Failed to save payment settings')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl">
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Payment Settings</h2>
                    <p className="text-gray-600 mt-1">Manage how you receive payments from customers</p>
                </div>

                <form onSubmit={handleSave} className="space-y-8">
                    {/* Primary Payment Method */}
                    <div className="pb-6 border-b">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Primary Payment Method *
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            {[
                                { value: 'upi', label: 'UPI', icon: '📱' },
                                { value: 'bank', label: 'Bank Transfer', icon: '🏦' },
                                { value: 'cash', label: 'Cash', icon: '💵' },
                                { value: 'all', label: 'All Methods', icon: '💳' }
                            ].map(method => (
                                <button
                                    key={method.value}
                                    type="button"
                                    onClick={() => setSettings(prev => ({ ...prev, primary_method: method.value }))}
                                    className={`p-4 border-2 rounded-lg transition-all ${settings.primary_method === method.value
                                            ? 'border-blue-600 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="text-3xl mb-2">{method.icon}</div>
                                    <div className="text-sm font-medium">{method.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bank Transfer Details */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            🏦 Bank Transfer Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Account Holder Name
                                </label>
                                <input
                                    type="text"
                                    value={settings.account_holder_name}
                                    onChange={e => setSettings(prev => ({ ...prev, account_holder_name: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Bank Name
                                </label>
                                <input
                                    type="text"
                                    value={settings.bank_name}
                                    onChange={e => setSettings(prev => ({ ...prev, bank_name: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="State Bank of India"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Account Number
                                </label>
                                <input
                                    type="text"
                                    value={settings.account_number}
                                    onChange={e => setSettings(prev => ({ ...prev, account_number: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="1234567890"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    IFSC Code
                                </label>
                                <input
                                    type="text"
                                    value={settings.ifsc_code}
                                    onChange={e => setSettings(prev => ({ ...prev, ifsc_code: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="SBIN0001234"
                                />
                            </div>
                        </div>
                    </div>

                    {/* UPI Details */}
                    <div className="space-y-4 pt-6 border-t">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            📱 UPI / Digital Wallet
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    UPI ID
                                </label>
                                <input
                                    type="text"
                                    value={settings.upi_id}
                                    onChange={e => setSettings(prev => ({ ...prev, upi_id: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="yourname@upi"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment QR Code
                                </label>
                                <div className="flex items-center gap-3">
                                    <label className="cursor-pointer px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span>Upload QR</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleQRUpload}
                                            disabled={uploading}
                                            className="hidden"
                                        />
                                    </label>
                                    {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
                                </div>
                                {settings.qr_code_url && (
                                    <div className="mt-3">
                                        <img
                                            src={settings.qr_code_url}
                                            alt="Payment QR Code"
                                            className="w-32 h-32 object-contain border rounded-lg"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-6 border-t">
                        <button
                            type="submit"
                            disabled={saving}
                            className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-md ${saving ? 'opacity-75 cursor-not-allowed' : ''
                                }`}
                        >
                            {saving ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </span>
                            ) : (
                                'Save Payment Settings'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
