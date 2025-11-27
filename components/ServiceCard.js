import Link from 'next/link'

export default function ServiceCard({ service, category }) {
    return (
        <Link href={`/book-service?service=${service.id}`}>
            <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group">
                {/* Service Image Placeholder */}
                <div className="relative h-48 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center overflow-hidden">
                    <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
                        {category?.icon || '🔧'}
                    </span>
                    {service.base_price && (
                        <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full shadow-md">
                            <span className="text-sm font-bold text-purple-600">₹{service.base_price}+</span>
                        </div>
                    )}
                </div>

                {/* Service Info */}
                <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition">
                        {service.name}
                    </h3>

                    {service.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {service.description}
                        </p>
                    )}

                    {/* Service Details */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                            ⭐ 4.8
                        </span>
                        {service.is_fixed_location ? (
                            <span className="flex items-center gap-1">📍 Fixed Location</span>
                        ) : (
                            <span className="flex items-center gap-1">🚗 Mobile Service</span>
                        )}
                    </div>

                    {/* Book Now Button */}
                    <button className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium text-sm">
                        Book Now
                    </button>
                </div>
            </div>
        </Link>
    )
}
