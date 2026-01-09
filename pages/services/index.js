import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ServiceCard from '../../components/ServiceCard'

export default function Services({ user }) {
    const [categories, setCategories] = useState([])
    const [services, setServices] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const { data: cats } = await supabase
                .from('service_categories')
                .select('*')
                .eq('is_active', true)
                .order('name')

            setCategories(cats || [])

            const { data: servs } = await supabase
                .from('services')
                .select('*, category:service_categories(*)')
                .eq('is_active', true)
                .order('name')

            setServices(servs || [])
        } catch (error) {
            console.error('Error loading services:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredServices = services.filter(service => {
        const matchesCategory = selectedCategory === 'all' || service.category_id === selectedCategory
        const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.description?.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    return (
        <div className="min-h-screen bg-[#F8F9FD]">
            <Header user={user} onSearch={setSearchQuery} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                {/* Hero section */}
                <div className="mb-20">
                    <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-3">Service Catalog</p>
                    <h1 className="text-6xl font-black text-gray-900 tracking-tighter uppercase leading-none mb-6">
                        Expert <span className="text-purple-600 italic">Solutions</span>
                    </h1>
                    <p className="text-gray-400 font-bold text-xl max-w-2xl leading-relaxed italic">
                        "Curated professional services delivered by verified local artisans and technicians."
                    </p>
                </div>

                {/* Category Selector */}
                <div className="flex items-center gap-4 overflow-x-auto pb-10 scrollbar-hide -mx-4 px-4">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`px-8 py-4 rounded-[24px] font-black text-sm uppercase tracking-widest transition-all whitespace-nowrap shadow-sm ${selectedCategory === 'all'
                            ? 'bg-gray-900 text-white shadow-xl shadow-gray-200 ring-4 ring-gray-100'
                            : 'bg-white text-gray-400 hover:text-gray-600 border border-gray-100 hover:border-gray-200'
                            }`}
                    >
                        Directory
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-8 py-4 rounded-[24px] font-black text-sm uppercase tracking-widest transition-all flex items-center gap-3 whitespace-nowrap shadow-sm ${selectedCategory === cat.id
                                ? 'bg-purple-600 text-white shadow-xl shadow-purple-100 ring-4 ring-purple-50'
                                : 'bg-white text-gray-400 hover:text-gray-600 border border-gray-100 hover:border-gray-200'
                                }`}
                        >
                            <span className="text-xl filter drop-shadow-sm">{cat.icon}</span>
                            <span>{cat.name}</span>
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-[450px] bg-white/50 rounded-[40px] animate-pulse border border-gray-100 shadow-sm"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {filteredServices.length > 0 ? (
                            filteredServices.map(service => (
                                <ServiceCard
                                    key={service.id}
                                    service={service}
                                    category={service.category}
                                />
                            ))
                        ) : (
                            <div className="col-span-full py-32 glass-premium bg-white/50 rounded-[40px] border border-gray-100 text-center">
                                <div className="text-8xl mb-6 opacity-10">🔭</div>
                                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">End of the line</h3>
                                <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-xs italic">No matching services found in this quadrant.</p>
                                <button
                                    onClick={() => { setSearchQuery(''); setSelectedCategory('all') }}
                                    className="mt-8 px-8 py-3 bg-purple-100 text-purple-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    )
}
