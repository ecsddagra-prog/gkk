import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import axios from 'axios'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'
import Footer from '../components/Footer'
import CategoryCard from '../components/CategoryCard'
import TrustBadge from '../components/TrustBadge'
import ServiceCard from '../components/ServiceCard'
import ServiceBookingModal from '../components/booking/ServiceBookingModal'

export default function Home({ user }) {
  const router = useRouter()
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCity, setSelectedCity] = useState(null)
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState(null)

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
      return
    }
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadData = async () => {
    try {
      // Load cities
      const { data: citiesData } = await supabase
        .from('cities')
        .select('*')
        .eq('is_active', true)
        .order('name')

      setCities(citiesData || [])
      if (citiesData && citiesData.length > 0) {
        setSelectedCity(citiesData[0].id)
      }

      // Load categories
      const { data: categoriesData } = await supabase
        .from('service_categories')
        .select('*')
        .eq('is_active', true)
        .order('name')

      setCategories(categoriesData || [])

      // Load services for selected city
      if (citiesData && citiesData.length > 0) {
        loadServices(citiesData[0].id)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadServices = async (cityId) => {
    try {
      const { data } = await axios.get(`/api/catalog/home-services?city_id=${cityId}`)
      setServices(data.services || [])
    } catch (error) {
      console.error('Error loading services:', error)
      setServices([])
    }
  }

  useEffect(() => {
    if (selectedCity) {
      loadServices(selectedCity)
    }
  }, [selectedCity])

  const handleCityChange = (cityId) => {
    setSelectedCity(cityId)
  }

  const filteredServices = searchQuery
    ? services.filter(s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : services

  const handleBookService = (service) => {
    if (!user) {
      router.push(`/login?redirect=/book-service?service=${service.id}`)
      return
    }
    setSelectedServiceForBooking(service.id)
    setShowBookingModal(true)
  }

  const popularServices = filteredServices.slice(0, 8)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading services...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        user={user}
        cities={cities}
        selectedCity={selectedCity}
        onCityChange={handleCityChange}
      />

      {/* Popular Services (Moved to Top for Visibility) */}
      {popularServices.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white border-b border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {searchQuery ? 'Search Results' : 'Popular Services'}
            </h2>
            {!searchQuery && (
              <Link href="/services" className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                View All →
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularServices.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                category={service.category || categories.find(c => c.id === service.category_id)}
                onBook={handleBookService}
              />
            ))}
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Home services at your doorstep
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 mb-8">
              What are you looking for?
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg shadow-2xl p-2 flex items-center">
                <span className="text-2xl px-3">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for services (e.g., cleaning, repair, salon...)"
                  className="flex-1 px-3 py-3 text-gray-900 outline-none text-lg"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-gray-400 hover:text-gray-600 px-3"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto mt-12">
            <TrustBadge icon="⭐" value="4.8" label="Service Rating" />
            <TrustBadge icon="👥" value="12M+" label="Customers Globally" />
            <TrustBadge icon="✅" value="50K+" label="Verified Professionals" />
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            All Services by Category
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map(category => {
              const categoryServices = services.filter(s => s.category_id === category.id)
              if (categoryServices.length === 0) return null

              return (
                <CategoryCard
                  key={category.id}
                  category={category}
                  services={categoryServices}
                />
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-gradient-to-br from-purple-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Why Choose Home Solution?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">Verified Professionals</h3>
              <p className="text-gray-600 text-sm">
                All service providers are verified and background checked for your safety
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">📍</div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">Real-time Tracking</h3>
              <p className="text-gray-600 text-sm">
                Track your service provider in real-time and know exactly when they arrive
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">Cashback & Rewards</h3>
              <p className="text-gray-600 text-sm">
                Earn cashback and rewards points on every booking you make
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">24/7 Support</h3>
              <p className="text-gray-600 text-sm">
                Our customer support team is available round the clock to help you
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join millions of satisfied customers and experience hassle-free home services
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition font-bold text-lg"
            >
              Sign Up Now
            </Link>
            <Link
              href="/provider/register"
              className="px-8 py-4 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition font-bold text-lg border-2 border-white"
            >
              Become a Professional
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      <ServiceBookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        user={user}
        initialServiceId={selectedServiceForBooking}
        initialCityId={selectedCity}
      />
    </div>
  )
}
