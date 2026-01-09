import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ServiceCard from '../../components/ServiceCard'
import Link from 'next/link'

export default function CategoryServices({ user }) {
    const router = useRouter()
    const { id } = router.query
    const [category, setCategory] = useState(null)
    const [services, setServices] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (id) {
            loadCategoryData(id)
        }
    }, [id])

    const loadCategoryData = async (categoryId) => {
        try {
            const { data: cat } = await supabase
                .from('service_categories')
                .select('*')
                .eq('id', categoryId)
                .single()

            if (!cat) {
                router.push('/services')
                return
            }
            setCategory(cat)

            const { data: servs } = await supabase
                .from('services')
                .select('*, category:service_categories(*)')
                .eq('category_id', categoryId)
                .eq('is_active', true)
                .order('name')

            setServices(servs || [])
        } catch (error) {
            console.error('Error loading category:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F8F9FD]">
            <Header user={user} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Hero / Header Area */}
                <div className="glass-premium bg-white/70 rounded-[40px] p-10 md:p-16 mb-12 flex flex-col items-center text-center shadow-2xl border border-white/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-100 rounded-full blur-3xl -ml-32 -mb-32 opacity-50"></div>

                    <div className="text-8xl mb-6 drop-shadow-lg relative z-10">{category?.icon || '🔧'}</div>
                    <h1 className="text-5xl font-black text-gray-900 tracking-tight relative z-10 mb-4">
                        {category?.name} <span className="text-purple-600">Experts</span>
                    </h1>
                    <p className="text-gray-500 text-xl max-w-2xl relative z-10">
                        {category?.description || `Professional ${category?.name} services at your doorstep. Background checked and certified pros.`}
                    </p>

                    <div className="mt-8 flex gap-4 relative z-10">
                        <span className="px-4 py-2 bg-white rounded-full text-xs font-bold text-gray-600 shadow-sm border border-gray-100 uppercase tracking-widest">Verified Pros</span>
                        <span className="px-4 py-2 bg-white rounded-full text-xs font-bold text-gray-600 shadow-sm border border-gray-100 uppercase tracking-widest">4.8+ Rating</span>
                    </div>
                </div>

                {/* Grid Title */}
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold text-gray-900">Available Services</h3>
                    <Link href="/services" className="text-purple-600 font-bold hover:underline">View Categories</Link>
                </div>

                {services.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map(service => (
                            <div key={service.id} className="group">
                                <ServiceCard
                                    service={service}
                                    category={category}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 glass-premium bg-white/50 rounded-[40px] border border-gray-100">
                        <div className="text-6xl mb-4 opacity-20">⚒️</div>
                        <h3 className="text-xl font-bold text-gray-900 tracking-tight">Launching Soon!</h3>
                        <p className="text-gray-500 mt-1 max-w-sm mx-auto">We're onboarding the best pros for this category. Stay tuned for expert services.</p>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    )
}
