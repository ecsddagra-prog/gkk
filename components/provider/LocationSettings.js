import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import LocationPicker from '../ui/LocationPicker'

export default function LocationSettings() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState({
        service_radius_km: 10,
        is_fixed_location: false,
        fixed_location_lat: 27.1767,
        fixed_location_lng: 78.0081,
        fixed_location_address: '',
        is_online: false
    })
    const [message, setMessage] = useState({ type: '', text: '' })
    const [isEditingLocation, setIsEditingLocation] = useState(false)

    useEffect(() => {
        fetchSettings()
    }, [])

    async function fetchSettings() {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) throw new Error('No session found')

            const res = await fetch('/api/provider/location', {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            })
            if (!res.ok) throw new Error('Failed to fetch settings')
            const data = await res.json()

            // Only update if we got data back
            if (data) {
                setSettings(prev => ({
                    ...prev,
                    ...data,
                    // Ensure numbers are actually numbers
                    service_radius_km: Number(data.service_radius_km) || 10,
                    fixed_location_lat: Number(data.fixed_location_lat) || 27.1767,
                    fixed_location_lng: Number(data.fixed_location_lng) || 78.0081,
                    is_online: Boolean(data.is_online)
                }))
            }
        } catch (error) {
            console.error('Error fetching settings:', error)
            setMessage({ type: 'error', text: 'Failed to load settings' })
        } finally {
            setLoading(false)
        }
    }

    async function saveSettings(e) {
        e.preventDefault()
        setSaving(true)
        setMessage({ type: '', text: '' })

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) throw new Error('No session found')

            const res = await fetch('/api/provider/location', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify(settings)
            })

            if (!res.ok) {
                const errorText = await res.text()
                throw new Error(`Failed to save settings: ${errorText}`)
            }

            const data = await res.json()

            setMessage({ type: 'success', text: 'Settings saved successfully!' })
            setIsEditingLocation(false) // Lock location after save
            setTimeout(() => setMessage({ type: '', text: '' }), 3000)
        } catch (error) {
            console.error('Error saving settings:', error)
            setMessage({ type: 'error', text: 'Failed to save settings' })
        } finally {
            setSaving(false)
        }
    }

    const handleLocationChange = (location) => {
        setSettings(prev => ({
            ...prev,
            fixed_location_lat: location.lat,
            fixed_location_lng: location.lng
        }))
    }

    if (loading) return <div className="p-8 text-center">Loading settings...</div>

    return (
        <div className="max-w-4xl">
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Location & Radius Settings</h2>

                    {/* Online/Offline Toggle */}
                    <div className="flex items-center space-x-3">
                        <span className={`text-sm font-medium ${settings.is_online ? 'text-green-600' : 'text-gray-500'}`}>
                            {settings.is_online ? 'Online' : 'Offline'}
                        </span>
                        <button
                            type="button"
                            onClick={() => setSettings(s => ({ ...s, is_online: !s.is_online }))}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${settings.is_online ? 'bg-green-600' : 'bg-gray-200'
                                }`}
                            role="switch"
                            aria-checked={settings.is_online}
                        >
                            <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.is_online ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                            />
                        </button>
                    </div>
                </div>

                {message.text && (
                    <div className={`fixed top-20 right-4 z-50 px-6 py-4 rounded-lg shadow-xl border animate-slideIn ${message.type === 'error'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-green-50 text-green-700 border-green-200'
                        }`}>
                        <div className="flex items-center gap-2">
                            {message.type === 'error' ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                            <span className="font-medium">{message.text}</span>
                        </div>
                    </div>
                )}

                <form onSubmit={saveSettings} className="space-y-8">
                    {/* Service Radius Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Service Area</h3>
                        <div className="max-w-xs">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Service Radius (km)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                value={settings.service_radius_km}
                                onChange={e => setSettings({ ...settings, service_radius_km: Number(e.target.value) })}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                How far from your location are you willing to travel?
                            </p>
                        </div>
                    </div>

                    <hr className="border-gray-200" />

                    {/* Fixed Location Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Base Location</h3>
                                <p className="text-sm text-gray-500">
                                    Set your base location for calculating distance
                                </p>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="is_fixed_location"
                                    checked={settings.is_fixed_location}
                                    onChange={e => {
                                        const isChecked = e.target.checked
                                        setSettings({ ...settings, is_fixed_location: isChecked })
                                        if (isChecked) setIsEditingLocation(true)
                                    }}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="is_fixed_location" className="ml-2 block text-sm text-gray-900">
                                    I operate from a fixed location (Shop/Office)
                                </label>
                            </div>
                        </div>

                        {settings.is_fixed_location && (
                            <div className="space-y-4 animate-fadeIn">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.fixed_location_address || ''}
                                        onChange={e => setSettings({ ...settings, fixed_location_address: e.target.value })}
                                        placeholder="Enter your full address"
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Pin Location on Map
                                        </label>
                                        {!isEditingLocation && settings.fixed_location_lat && (
                                            <button
                                                type="button"
                                                onClick={() => setIsEditingLocation(true)}
                                                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                                Change Location
                                            </button>
                                        )}
                                    </div>

                                    <LocationPicker
                                        value={{
                                            lat: settings.fixed_location_lat,
                                            lng: settings.fixed_location_lng
                                        }}
                                        onChange={handleLocationChange}
                                        readOnly={!isEditingLocation}
                                    />

                                    {isEditingLocation ? (
                                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                            <p className="text-sm text-blue-700 font-medium">
                                                📍 Editing Mode Active
                                            </p>
                                            <p className="text-xs text-blue-600 mt-1">
                                                Drag the map to adjust your location, then save settings.
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="mt-2 text-sm text-gray-500">
                                            {settings.fixed_location_lat
                                                ? '🔒 Location is locked. Click "Change Location" to edit.'
                                                : 'Drag the map to set your location, then save.'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-gray-200 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${saving ? 'opacity-75 cursor-not-allowed' : ''
                                }`}
                        >
                            {saving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
