import dynamic from 'next/dynamic'

const MapComponent = dynamic(() => import('./LocationPickerMap'), {
    ssr: false,
    loading: () => (
        <div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
            <span className="text-gray-400">Loading map...</span>
        </div>
    ),
})

export default function LocationPicker({
    center = [27.1767, 78.0081],
    zoom = 13,
    value,
    onChange,
    readOnly = false
}) {
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
