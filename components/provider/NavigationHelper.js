export default function NavigationHelper({ booking }) {
    if (!booking || !booking.service_lat || !booking.service_lng) {
        return null
    }

    const openGoogleMaps = () => {
        const destination = `${booking.service_lat},${booking.service_lng}`
        const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`
        window.open(url, '_blank')
    }

    const openWaze = () => {
        const url = `https://waze.com/ul?ll=${booking.service_lat},${booking.service_lng}&navigate=yes`
        window.open(url, '_blank')
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow-md border">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
                🗺️ Navigate to Customer
            </h3>

            <div className="space-y-2">
                <p className="text-sm text-gray-600 mb-3">
                    <strong>Address:</strong> {booking.service_address || 'Address not provided'}
                </p>

                <div className="flex gap-2">
                    <button
                        onClick={openGoogleMaps}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm font-medium"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                        Google Maps
                    </button>

                    <button
                        onClick={openWaze}
                        className="flex-1 bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600 flex items-center justify-center gap-2 text-sm font-medium"
                    >
                        🚗 Waze
                    </button>
                </div>

                <p className="text-xs text-gray-500 text-center mt-2">
                    Click to open navigation in your preferred app
                </p>
            </div>
        </div>
    )
}
