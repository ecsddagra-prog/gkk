import Link from 'next/link'
import { Star, ArrowRight } from 'lucide-react'

export default function ServiceCard({ service, category, onBook, isSelected, onToggleSelect }) {
    const CardContent = () => (
        <div className={`glass-premium bg-white/70 rounded-[40px] border shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer group h-full flex flex-col ${isSelected ? 'border-purple-600 ring-4 ring-purple-100' : 'border-white hover:border-purple-200'}`}>
            {/* Service Image Section */}
            <div className="relative h-64 bg-purple-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                <div className="text-8xl group-hover:scale-125 transition-transform duration-700 ease-out z-10 filter drop-shadow-lg">
                    {category?.icon || '🔧'}
                </div>
                {/* Decorative Elements */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg z-20">
                    <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-xs font-black text-gray-900">4.9</span>
                    </div>
                </div>
            </div>

            {/* Service Info */}
            <div className="p-8 flex flex-col flex-1">
                <div className="mb-4">
                    <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1">{category?.name || 'Home Service'}</p>
                    <h3 className="text-2xl font-black text-gray-900 group-hover:text-purple-600 transition-colors uppercase tracking-tighter leading-none">
                        {service.name}
                    </h3>
                </div>

                {service.description && (
                    <p className="text-sm font-bold text-gray-400 mb-6 italic line-clamp-2 flex-1 leading-relaxed">
                        "{service.description}"
                    </p>
                )}

                {/* Bottom Bar */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-auto">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Starting at</span>
                        <span className="text-2xl font-black text-gray-900 tracking-tighter">₹{service.base_price || 299}</span>
                    </div>
                    <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center group-hover:bg-purple-600 group-hover:translate-x-1 transition-all">
                        <ArrowRight className="w-6 h-6" />
                    </div>
                </div>
            </div>
        </div>
    )

    if (onToggleSelect) {
        return (
            <div onClick={() => onToggleSelect(service)}>
                <CardContent />
            </div>
        )
    }

    if (onBook) {
        return (
            <div onClick={() => onBook(service)}>
                <CardContent />
            </div>
        )
    }

    return (
        <Link href={`/services/${service.id}`}>
            <CardContent />
        </Link>
    )
}
