import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function LocationTracker() {
    const [loading, setLoading] = useState(false)
    const [location, setLocation] = useState(null)
    const [isOnline, setIsOnline] = useState(false)
    const [isFixedLocation, setIsFixedLocation] = useState(false)
    const [trackingEnabled, setTrackingEnabled] = useState(false)
    const watchIdRef = useRef(null)
    const lastUpdateRef = useRef(0)
    const lastLocationRef = useRef(null)

    useEffect(() => {
        loadCurrentLocation()

        return () => {
            if (watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current)
            }
        }
    }, [])

    // Auto-tracking effect
    useEffect(() => {
        // Only track if online AND not a fixed location
        if (isOnline && !isFixedLocation) {
            startTracking()
        } else {
            stopTracking()
        }
    }, [isOnline, isFixedLocation])

    const startTracking = () => {
        if (!navigator.geolocation) {
            console.error('Geolocation not supported')
            return
        }

        if (watchIdRef.current) return // Already tracking

        setTrackingEnabled(true)
        toast.success('Auto-tracking started')

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords
                handlePositionUpdate(latitude, longitude)
            },
            (error) => {
                console.error('Tracking error:', error)
                // Don't show error toast on every failure to avoid spamming
                if (error.code === 1) { // Permission denied
                    setTrackingEnabled(false)
                    toast.error('Location permission denied')
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        )
    }

    const stopTracking = () => {
        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current)
            watchIdRef.current = null
        }
        setTrackingEnabled(false)
    }

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3 // metres
        const φ1 = lat1 * Math.PI / 180
        const φ2 = lat2 * Math.PI / 180
        const Δφ = (lat2 - lat1) * Math.PI / 180
        const Δλ = (lon2 - lon1) * Math.PI / 180

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

        return R * c
    }

    const handlePositionUpdate = async (lat, lng) => {
        const now = Date.now()
        const timeDiff = now - lastUpdateRef.current

        // Check if we should update
        // 1. If no last location, update immediately
        // 2. If time diff > 5 minutes (300000 ms), update
        // 3. If distance > 50 meters, update

        let shouldUpdate = false

        if (!lastLocationRef.current) {
            shouldUpdate = true
        } else if (timeDiff > 300000) { // 5 minutes
            shouldUpdate = true
        } else {
            const distance = calculateDistance(
                lastLocationRef.current.lat,
                lastLocationRef.current.lng,
                lat,
                lng
            )
            if (distance > 50) { // 50 meters
                shouldUpdate = true
            }
        }

        if (shouldUpdate) {
            await updateLocation(lat, lng, true) // true = silent update (no toast)
            lastUpdateRef.current = now
            lastLocationRef.current = { lat, lng }
        }
    }

    const loadCurrentLocation = async () => {
        try {
            const token = (await supabase.auth.getSession()).data.session?.access_token
            const { data } = await axios.get('/api/provider/location', {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (data) {
                if (data.current_lat && data.current_lng) {
                    setLocation({
                        lat: data.current_lat,
                        lng: data.current_lng
                    })
                    lastLocationRef.current = {
                        lat: data.current_lat,
                        lng: data.current_lng
                    }
                }
                setIsOnline(data.is_online || false)
                setIsFixedLocation(data.is_fixed_location || false)
            }
        } catch (error) {
            console.error('Error loading location:', error)
        }
    }

    const updateLocation = async (lat, lng, silent = false) => {
        try {
            if (!silent) setLoading(true)
            const token = (await supabase.auth.getSession()).data.session?.access_token
            await axios.put('/api/provider/location', {
                latitude: lat,
                longitude: lng,
                is_online: isOnline
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            setLocation({ lat, lng })
            if (!silent) toast.success('Location updated successfully!')
        } catch (error) {
            console.error('Error updating location:', error)
            if (!silent) toast.error('Failed to update location')
        } finally {
            if (!silent) setLoading(false)
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

            if (!location && !newStatus) {
                // Allow going offline without location, but require location for online? 
                // Actually, if we are movable, we might not have a location yet.
                // But let's keep existing check if it was there, or relax it.
                // The original code checked !location. Let's keep it but maybe we can fetch it first?
            }

            if (!location && newStatus) {
                // Try to get location first if going online
                // For now, just warn as before
                toast.error('Please update your location first')
                return
            }

            await axios.put('/api/provider/location', {
                is_online: newStatus
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            setIsOnline(newStatus)
            toast.success(`You are now ${newStatus ? 'online' : 'offline'}`)
        } catch (error) {
            console.error(error)
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
                        {trackingEnabled && (
                            <p className="text-xs text-green-600 font-medium mt-1 flex items-center animate-pulse">
                                <span className="w-2 h-2 bg-green-600 rounded-full mr-1"></span>
                                Auto-tracking active
                            </p>
                        )}
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
                            {isFixedLocation && (
                                <p className="text-xs text-gray-500 mt-2">
                                    (Fixed Location - Auto-tracking disabled)
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">No location set</p>
                    )}
                </div>

                {/* Update Location Button */}
                <button
                    onClick={getCurrentPosition}
                    disabled={loading || trackingEnabled}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Updating...
                        </>
                    ) : trackingEnabled ? (
                        <>
                            📡 Auto-tracking is on
                        </>
                    ) : (
                        <>
                            📍 Update My Location
                        </>
                    )}
                </button>

                <p className="text-xs text-gray-500 mt-2 text-center">
                    {trackingEnabled
                        ? 'Location is updating automatically as you move.'
                        : 'Click to use your device\'s GPS to update your current location'
                    }
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
