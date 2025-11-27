import Link from 'next/link'

export default function CategoryCard({ category, services = [] }) {
    const displayServices = services.slice(0, 6)
    const hasMore = services.length > 6

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            {/* Category Header */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl">{category.icon || '🔧'}</span>
                    <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                </div>
                {category.description && (
                    <p className="text-sm text-gray-600">{category.description}</p>
                )}
            </div>

            {/* Services List */}
            <div className="p-6">
                <div className="grid grid-cols-2 gap-3">
                    {displayServices.map((service, index) => (
                        <Link
                            key={service.id || index}
                            href={`/book-service?service=${service.id}`}
                            className="group"
                        >
                            <div className="flex items-start gap-2 p-3 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer">
                                <span className="text-purple-600 mt-0.5">→</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 group-hover:text-purple-600 transition truncate">
                                        {service.name}
                                    </p>
                                    {service.base_price && (
                                        <p className="text-xs text-gray-500">₹{service.base_price}+</p>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* See All Link */}
                {hasMore && (
                    <Link
                        href={`/services/${category.id}`}
                        className="block mt-4 text-center text-purple-600 hover:text-purple-700 font-medium text-sm"
                    >
                        +{services.length - 6} more services →
                    </Link>
                )}
            </div>
        </div>
    )
}
