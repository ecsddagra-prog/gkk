import { useEffect, useRef, useState, useMemo } from 'react'
import { MapContainer, TileLayer, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
})

function MapEvents({ value, onChange, readOnly }) {
    const map = useMap()
    const isFirstLoad = useRef(true)
    const isInitialized = useRef(false)

    useEffect(() => {
        if (!isInitialized.current) {
            isInitialized.current = true
            if (value && isFirstLoad.current) {
                map.setView([value.lat, value.lng], map.getZoom())
                isFirstLoad.current = false
            }
        }
    }, [value, map])

    useEffect(() => {
        if (readOnly) {
            map.dragging.disable()
            map.scrollWheelZoom.disable()
        } else {
            map.dragging.enable()
            map.scrollWheelZoom.enable()
        }
    }, [readOnly, map])

    useMapEvents({
        moveend: () => {
            if (!readOnly && onChange) {
                const center = map.getCenter()
                onChange({ lat: center.lat, lng: center.lng })
            }
        }
    })

    return null
}

function LocateButton({ readOnly }) {
    const map = useMap()
    const [loading, setLoading] = useState(false)

    const handleLocate = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser')
            return
        }

        setLoading(true)
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords
                map.flyTo([latitude, longitude], 16, { duration: 1.5 })
                setLoading(false)
            },
            (error) => {
                console.error('Error getting location:', error)
                alert('Unable to get your location. Please enable location services.')
                setLoading(false)
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        )
    }

    if (readOnly) return null

    return (
        <button
            onClick={handleLocate}
            disabled={loading}
            className="absolute top-4 right-4 z-[1000] bg-white hover:bg-gray-50 active:bg-gray-100 p-3 rounded-lg shadow-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="My Location"
            style={{ pointerEvents: 'auto' }}
        >
            {loading ? (
                <>
                    <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Locating...</span>
                </>
            ) : (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>My Location</span>
                </>
            )}
        </button>
    )
}

export default function LocationPickerMap({ center, zoom, value, onChange, readOnly }) {
    const mapKey = useMemo(() => Math.random().toString(36), [])
    const mapCenter = useMemo(() => value ? [value.lat, value.lng] : center, [value, center])
    
    return (
        <div className="h-[400px] w-full rounded-lg overflow-hidden border border-gray-300 relative">
            <MapContainer
                key={mapKey}
                center={mapCenter}
                zoom={zoom}
                zoomControl={true}
                style={{ height: '100%', width: '100%' }}
                whenReady={() => console.log('Map ready')}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <MapEvents value={value} onChange={onChange} readOnly={readOnly} />
                <LocateButton readOnly={readOnly} />
            </MapContainer>

            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] pointer-events-none pb-[41px]">
                <img
                    src="https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png"
                    alt="Center Marker"
                    className="w-[25px] h-[41px]"
                    style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.3))' }}
                />
            </div>
        </div>
    )
}
