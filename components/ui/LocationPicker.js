import { useState, useEffect } from 'react'

export default function LocationPicker({
    center = [27.1767, 78.0081],
    zoom = 13,
    value,
    onChange,
    readOnly = false
}) {
    const [mapLoaded, setMapLoaded] = useState(false)
    const [MapComponent, setMapComponent] = useState(null)

    useEffect(() => {
        // Dynamically import to avoid SSR issues
        import('./LocationPickerMap')
            .then((mod) => {
                setMapComponent(() => mod.default)
                setMapLoaded(true)
            })
            .catch((err) => {
                console.error('Failed to load map:', err)
            })
    }, [])

    if (!mapLoaded || !MapComponent) {
        return (
            <div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
                <span className="text-gray-400">Loading map...</span>
            </div>
        )
    }

    return (
        <MapComponent
            center={center}
            zoom={zoom}
            value={value}
            onChange={onChange}
            readOnly={readOnly}
        />
    )
}
