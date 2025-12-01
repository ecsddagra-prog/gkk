import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ServiceCard from '../../components/ServiceCard'

export default function Services() {
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
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="bg-purple-700 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">Our Services</h1>
                    <p className="text-purple-100 text-xl max-w-2xl mx-auto">
                        Explore our wide range of professional home services tailored to your needs.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search services..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                    <div className="md:w-64">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    </div>
                ) : (
                    <>
                        {filteredServices.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredServices.map(service => (
                                    <ServiceCard
                                        key={service.id}
                                        service={service}
                                        category={service.category}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-gray-500">
                                No services found matching your criteria.
                            </div>
                        )}
                    </>
                )}
            </div>

            <Footer />
        </div>
    )
}
