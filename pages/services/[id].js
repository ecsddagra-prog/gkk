import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ServiceCard from '../../components/ServiceCard'

export default function CategoryServices() {
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
            // Load category details
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

            // Load services in this category
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="bg-purple-700 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="text-6xl mb-4">{category?.icon || '🔧'}</div>
                    <h1 className="text-4xl font-bold text-white mb-4">{category?.name}</h1>
                    <p className="text-purple-100 text-xl max-w-2xl mx-auto">
                        {category?.description || `Professional ${category?.name} services at your doorstep.`}
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {services.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map(service => (
                            <ServiceCard
                                key={service.id}
                                service={service}
                                category={category}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                        <p className="text-gray-500 text-lg">No services available in this category yet.</p>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    )
}
