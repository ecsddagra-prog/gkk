import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Header from '../../components/Header'

export default function SavedProviders({ user }) {
    const router = useRouter()

    // Mock data for saved providers
    const [savedProviders] = useState([
        {
            id: 1,
            name: "Rajesh Electric Works",
            service: "Electrician",
            rating: 4.8,
            jobs: 142,
            image: "⚡"
        },
        {
            id: 2,
            name: "Clean Home Services",
            service: "Cleaning",
            rating: 4.9,
            jobs: 89,
            image: "🧹"
        },
        {
            id: 3,
            name: "Fast Plumbers",
            service: "Plumbing",
            rating: 4.7,
            jobs: 215,
            image: "🔧"
        }
    ])

    return (
        <div className="min-h-screen bg-[#F8F9FD]">
            <Header user={user} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <Link href="/profile" className="text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2 mb-4 font-medium">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                        Back to Profile
                    </Link>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Saved Providers</h1>
                    <p className="text-gray-500 mt-2">Your favorite experts and service teams.</p>
                </div>

                {savedProviders.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <div className="text-6xl mb-4">👥</div>
                        <h3 className="text-xl font-bold text-gray-900">No saved providers yet</h3>
                        <p className="text-gray-500 mt-2">Book services and save providers you like!</p>
                        <Link href="/" className="inline-block mt-6 px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors">
                            Find Services
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {savedProviders.map(provider => (
                            <div key={provider.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-3xl">
                                        {provider.image}
                                    </div>
                                    <button className="w-10 h-10 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center hover:bg-pink-100 transition-colors">
                                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                                    </button>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-1">{provider.name}</h3>
                                <p className="text-purple-600 text-sm font-bold uppercase tracking-wider mb-4">{provider.service}</p>

                                <div className="flex items-center gap-4 text-sm text-gray-500 border-t border-gray-100 pt-4">
                                    <div className="flex items-center gap-1">
                                        <span className="text-amber-400">★</span>
                                        <span className="font-bold text-gray-900">{provider.rating}</span>
                                    </div>
                                    <span>•</span>
                                    <div>{provider.jobs} Jobs completed</div>
                                </div>

                                <button className="w-full mt-6 px-4 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors">
                                    Book Again
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
