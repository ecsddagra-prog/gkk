import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function LocationTracker() {
    const [loading, setLoading] = useState(false)
    const [location, setLocation] = useState(null)
    const [isOnline, setIsOnline] = useState(false)
    const [trackingEnabled, setTrackingEnabled] = useState(false)

    useEffect(() => {
        loadCurrentLocation()
    }, [])

    const loadCurrentLocation = async () => {
        try {
            const token = (await supabase.auth.getSession()).data.session?.access_token
            const { data } = await axios.get('/api/provider/location', {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (data.location) {
                setLocation({
                    lat: data.location.current_lat,
                    lng: data.location.current_lng
                })
                setIsOnline(data.location.is_online || false)
            }
        } catch (error) {
            console.error('Error loading location:', error)
        }
    }

    const updateLocation = async (lat, lng) => {
        try {
            setLoading(true)
            const token = (await supabase.auth.getSession()).data.session?.access_token
            await axios.put('/api/provider/location', {
                latitude: lat,
                longitude: lng,
                is_online: isOnline
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            setLocation({ lat, lng })
            toast.success('Location updated successfully!')
        } catch (error) {
            console.error('Error updating location:', error)
            toast.error('Failed to update location')
        } finally {
            setLoading(false)
        }
    }

    const getCurrentPosition = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser')
            return
        }

        setLoading(true)
        navigator.geolocation.getCurrentPosition(
            (position) => {
                updateLocation(position.coords.latitude, position.coords.longitude)
            },
            (error) => {
                setLoading(false)
                toast.error('Unable to get your location. Please enable location services.')
                console.error('Geolocation error:', error)
            }
        )
    }

    const toggleOnlineStatus = async () => {
        try {
            const newStatus = !isOnline
            const token = (await supabase.auth.getSession()).data.session?.access_token

            if (!location) {
                toast.error('Please update your location first')
                return
            }

            await axios.put('/api/provider/location', {
                latitude: location.lat,
                longitude: location.lng,
                is_online: newStatus
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            setIsOnline(newStatus)
            toast.success(`You are now ${newStatus ? 'online' : 'offline'}`)
        } catch (error) {
            toast.error('Failed to update status')
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Real-time Location Tracking</h2>

                {/* Online/Offline Toggle */}
                <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
                    <div>
                        <p className="font-medium">Service Status</p>
                        <p className="text-sm text-gray-500">
                            {isOnline ? 'You are accepting bookings' : 'You are not accepting bookings'}
                        </p>
                    </div>
                    <button
                        onClick={toggleOnlineStatus}
                        className={`px-6 py-3 rounded-lg font-medium transition ${isOnline
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                            }`}
                    >
                        {isOnline ? '🟢 Online' : '⚫ Offline'}
                    </button>
                </div>

                {/* Current Location */}
                <div className="mb-6">
                    <h3 className="font-medium mb-2">Current Location</h3>
                    {location ? (
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm">
                                <span className="font-medium">Latitude:</span> {location.lat}
                            </p>
                            <p className="text-sm">
                                <span className="font-medium">Longitude:</span> {location.lng}
                            </p>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">No location set</p>
                    )}
                </div>

                {/* Update Location Button */}
                <button
                    onClick={getCurrentPosition}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Updating...
                        </>
                    ) : (
                        <>
                            📍 Update My Location
                        </>
                    )}
                </button>

                <p className="text-xs text-gray-500 mt-2 text-center">
                    Click to use your device&apos;s GPS to update your current location
                </p>
            </div>

            {/* Info Box */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-sm text-yellow-800">
                    <strong>💡 Tip:</strong> Keep your location updated to receive nearby booking requests.
                    Customers can see how far you are from their location.
                </p>
            </div>
        </div>
    )
}
