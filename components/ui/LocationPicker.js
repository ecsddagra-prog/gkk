import { useState, useEffect, useRef, useCallback } from 'react'

export default function LocationPicker({
    center = [27.1767, 78.0081], // Default to Agra
    zoom = 13,
    value,
    onChange,
    readOnly = false
}) {
    const mapRef = useRef(null)
    const [MapModules, setMapModules] = useState(null)
    const [LeafletLib, setLeafletLib] = useState(null)

    useEffect(() => {
        // Dynamically import react-leaflet and leaflet modules to avoid SSR issues
        (async () => {
            try {
                const reactLeaflet = await import('react-leaflet')
                const leafletModule = await import('leaflet')

                // Handle both default and named exports
                const leaflet = leafletModule.default || leafletModule

                // Fix for default marker icon in Next.js
                if (leaflet.Icon) {
                    delete leaflet.Icon.Default.prototype._getIconUrl
                    leaflet.Icon.Default.mergeOptions({
                        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
                        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
                        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
                    })
                }

                setLeafletLib(leaflet)
                setMapModules(reactLeaflet)
            } catch (error) {
                console.error('Error loading map modules:', error)
            }
        })()
    }, [])

    if (!MapModules || !LeafletLib) {
        return (
            <div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
                <span className="text-gray-400">Loading map...</span>
            </div>
        )
    }

    const { MapContainer, TileLayer, useMap, useMapEvents } = MapModules

    // Component to handle map center updates and initial positioning
    function MapController({ value, onChange }) {
        const map = useMap()
        const isFirstLoad = useRef(true)

        // Handle initial positioning (only center, preserve zoom)
        useEffect(() => {
            if (value && isFirstLoad.current && map) {
                const currentZoom = map.getZoom()
                map.setView([value.lat, value.lng], currentZoom, { animate: false })
                isFirstLoad.current = false
            }
        }, [value, map])

        // Handle readOnly state - disable/enable interactions
        useEffect(() => {
            if (!map) return

            if (readOnly) {
                map.dragging.disable()
                map.touchZoom.disable()
                map.doubleClickZoom.disable()
                map.scrollWheelZoom.disable()
                map.boxZoom.disable()
                map.keyboard.disable()
                if (map.tap) map.tap.disable()
                map.getContainer().style.cursor = 'default'
            } else {
                map.dragging.enable()
                map.touchZoom.enable()
                map.doubleClickZoom.enable()
                map.scrollWheelZoom.enable()
                map.boxZoom.enable()
                map.keyboard.enable()
                if (map.tap) map.tap.enable()
                map.getContainer().style.cursor = 'grab'
            }
        }, [map, readOnly])

        // Listen for map movements
        useMapEvents({
            moveend: () => {
                if (!readOnly && onChange && map) {
                    const center = map.getCenter()
                    onChange({
                        lat: center.lat,
                        lng: center.lng
                    })
                }
            }
        })

        return null
    }

    // Component for Custom Zoom Controls
    function CustomZoomControl() {
        const map = useMap()

        const handleZoomIn = useCallback((e) => {
            e.preventDefault()
            e.stopPropagation()
            console.log('Zoom In clicked, map:', map)
            if (map) {
                try {
                    map.zoomIn()
                    console.log('Zoom in successful, current zoom:', map.getZoom())
                } catch (error) {
                    console.error('Error zooming in:', error)
                }
            }
        }, [map])

        const handleZoomOut = useCallback((e) => {
            e.preventDefault()
            e.stopPropagation()
            console.log('Zoom Out clicked, map:', map)
            if (map) {
                try {
                    map.zoomOut()
                    console.log('Zoom out successful, current zoom:', map.getZoom())
                } catch (error) {
                    console.error('Error zooming out:', error)
                }
            }
        }, [map])

        return (
            <div
                className="leaflet-control-container"
                style={{
                    position: 'absolute',
                    bottom: '20px',
                    right: '20px',
                    zIndex: 1000,
                    pointerEvents: 'auto'
                }}
            >
                <div className="flex flex-col shadow-lg rounded-md overflow-hidden bg-white">
                    <button
                        onClick={handleZoomIn}
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        className="p-2 hover:bg-gray-100 active:bg-gray-200 transition-colors flex items-center justify-center w-10 h-10 cursor-pointer border-b border-gray-200 text-gray-700"
                        title="Zoom In"
                        type="button"
                        style={{ pointerEvents: 'auto' }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <button
                        onClick={handleZoomOut}
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        className="p-2 hover:bg-gray-100 active:bg-gray-200 transition-colors flex items-center justify-center w-10 h-10 cursor-pointer text-gray-700"
                        title="Zoom Out"
                        type="button"
                        style={{ pointerEvents: 'auto' }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        )
    }

    // Component for the "Locate Me" button
    function LocateControl() {
        const map = useMap()

        const handleLocate = useCallback((e) => {
            e.preventDefault()
            e.stopPropagation()
            console.log('Locate Me clicked')

            if (!navigator.geolocation) {
                alert('Geolocation is not supported by your browser')
                return
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords
                    console.log('Got location:', latitude, longitude)
                    if (map) {
                        map.flyTo([latitude, longitude], 16)
                    }
                },
                (error) => {
                    console.error('Error getting location:', error)
                    alert('Unable to retrieve your location')
                }
            )
        }, [map])

        return (
            <div
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    zIndex: 1000,
                    pointerEvents: 'auto'
                }}
            >
                <button
                    onClick={handleLocate}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    className="bg-white p-2 hover:bg-gray-100 active:bg-gray-200 transition-colors shadow-lg rounded-md flex items-center justify-center w-10 h-10 cursor-pointer text-gray-700"
                    title="Locate Me"
                    type="button"
                    style={{ pointerEvents: 'auto' }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
            </div>
        )
    }

    return (
        <div className="h-[400px] w-full rounded-lg overflow-hidden border border-gray-300 z-0 relative group">
            <MapContainer
                center={value ? [value.lat, value.lng] : center}
                zoom={zoom}
                zoomControl={false}
                scrollWheelZoom={true}
                minZoom={3}
                maxZoom={20}
                style={{ height: '100%', width: '100%' }}
                ref={mapRef}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapController value={value} onChange={onChange} />
                <CustomZoomControl />
                {!readOnly && <LocateControl />}
            </MapContainer>

            {/* Fixed Center Marker - Always visible */}
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
