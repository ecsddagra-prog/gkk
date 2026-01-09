import Link from 'next/link'

export default function FloatingBookingBar({ selectedCount, onContinue }) {
    if (selectedCount === 0) return null

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-lg animate-slideUp">
            <div className="glass-premium bg-white/80 backdrop-blur-xl border border-white p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-600 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg ring-4 ring-purple-100">
                        {selectedCount}
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 leading-none">Services Selected</p>
                        <p className="text-sm text-gray-500 mt-1">Ready for checkout</p>
                    </div>
                </div>

                <button
                    onClick={onContinue}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2"
                >
                    Continue
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
            </div>
        </div>
    )
}
