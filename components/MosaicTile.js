import { useState } from 'react'

export default function MosaicTile({ service, category, isSelected, onToggleSelect, size = 'medium' }) {
    const [isFlipped, setIsFlipped] = useState(false)

    const sizeClasses = {
        small: 'row-span-1 col-span-1',
        medium: 'row-span-2 col-span-1',
        large: 'row-span-2 col-span-2',
        xl: 'row-span-3 col-span-2'
    }

    const handleFlip = (e) => {
        e.stopPropagation()
        setIsFlipped(!isFlipped)
    }

    const handleSelect = (e) => {
        e.stopPropagation()
        onToggleSelect(service)
    }

    return (
        <div
            className={`perspective-1000 ${sizeClasses[size] || sizeClasses.medium} cursor-pointer group`}
            onClick={handleFlip}
        >
            <div className={`flip-card-inner h-full w-full relative preserve-3d transition-transform duration-500 ${isFlipped ? 'rotate-y-180' : ''}`}>
                {/* Front Side */}
                <div className={`flip-card-front absolute inset-0 backface-hidden rounded-3xl overflow-hidden glass-premium flex flex-col p-6 transition-all duration-300 ${isSelected ? 'ring-4 ring-purple-600 ring-offset-2' : ''}`}>
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                            {category?.icon || '🔧'}
                        </span>
                        {service.base_price && (
                            <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                                <span className="text-xs font-bold text-purple-600">₹{service.base_price}+</span>
                            </div>
                        )}
                    </div>

                    <div className="mt-auto">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors leading-tight">
                            {service.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-2 opacity-60">
                            <span className="text-xs font-medium uppercase tracking-wider">{category?.name}</span>
                            <span className="text-xs">•</span>
                            <span className="text-xs">⭐ 4.8</span>
                        </div>
                    </div>

                    {isSelected && (
                        <div className="absolute top-4 right-4 bg-purple-600 text-white p-1 rounded-full animate-bounce">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                    )}
                </div>

                {/* Back Side */}
                <div className="flip-card-back absolute inset-0 backface-hidden rotate-y-180 rounded-3xl overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex flex-col p-6">
                    <div className="flex flex-col h-full">
                        <h4 className="font-bold text-lg mb-2">About {service.name}</h4>
                        <p className="text-sm text-purple-100 line-clamp-4 flex-1">
                            {service.description || 'High-quality professional service at your doorstep. Background checked and certified pros.'}
                        </p>

                        <div className="mt-auto pt-4 border-t border-white/20">
                            <button
                                onClick={handleSelect}
                                className={`w-full py-3 rounded-xl font-bold transition-all ${isSelected ? 'bg-white text-purple-700' : 'bg-purple-400/30 hover:bg-white/20 text-white border border-white/30'}`}
                            >
                                {isSelected ? 'Deselect Service' : 'Select for Booking'}
                            </button>
                            <button
                                onClick={handleFlip}
                                className="w-full mt-2 py-2 text-xs text-purple-200 hover:text-white transition-colors"
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
