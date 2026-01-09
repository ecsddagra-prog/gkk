import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import axios from 'axios'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'
import Footer from '../components/Footer'
import MosaicTile from '../components/MosaicTile'
import FloatingBookingBar from '../components/FloatingBookingBar'
import ServiceBookingModal from '../components/booking/ServiceBookingModal'

export default function Home({ user }) {
  const router = useRouter()
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedServices, setSelectedServices] = useState([])
  const [showBookingModal, setShowBookingModal] = useState(false)

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
      return
    }
    loadData()
  }, [user])

  const loadData = async () => {
    try {
      const { data: categoriesData } = await supabase
        .from('service_categories')
        .select('*')
        .eq('is_active', true)
        .order('name')
      setCategories(categoriesData || [])

      const { data } = await axios.get('/api/catalog/home-services')
      setServices(data.services || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleServiceSelection = (service) => {
    setSelectedServices(prev => {
      const isAlreadySelected = prev.find(s => s.id === service.id)
      if (isAlreadySelected) {
        return prev.filter(s => s.id !== service.id)
      } else {
        return [...prev, service]
      }
    })
  }

  const handleContinueBooking = () => {
    if (selectedServices.length === 0) return
    const serviceIds = selectedServices.map(s => s.id).join(',')
    router.push(`/book-service?services=${serviceIds}`)
  }

  const filteredServices = searchQuery
    ? services.filter(s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : services

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Preparing your experience...</p>
        </div>
      </div>
    )
  }

  // Group services for the mosaic grid sections
  const heroService = filteredServices[0]
  const popularServices = filteredServices.slice(1, 5)
  const dailyServices = filteredServices.slice(5, 15)
  const nicheServices = filteredServices.slice(15)

  return (
    <div className="min-h-screen bg-[#F8F9FD] pb-32">
      <Header
        user={user}
        onSearch={setSearchQuery}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Section: Hero & Popular */}
        <section className="mb-12">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                Premium <span className="text-purple-600">Home</span> Services
              </h2>
              <p className="text-gray-500 mt-2 text-lg">Asymmetrical, elegant, and at your doorstep.</p>
            </div>
          </div>

          <div className="mosaic-grid">
            {heroService && (
              <MosaicTile
                service={heroService}
                category={categories.find(c => c.id === heroService.category_id)}
                size="xl"
                isSelected={selectedServices.some(s => s.id === heroService.id)}
                onToggleSelect={toggleServiceSelection}
              />
            )}
            {popularServices.map((service, idx) => (
              <MosaicTile
                key={service.id}
                service={service}
                category={categories.find(c => c.id === service.category_id)}
                size={idx % 2 === 0 ? 'medium' : 'large'}
                isSelected={selectedServices.some(s => s.id === service.id)}
                onToggleSelect={toggleServiceSelection}
              />
            ))}
          </div>
        </section>

        {/* Middle Section: Daily Grid */}
        <section className="mb-12 pt-12 border-t border-gray-100">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900">Daily Essentials</h3>
            <p className="text-gray-500 mt-1">Services you need every day, delivered with care.</p>
          </div>

          <div className="mosaic-grid">
            {dailyServices.map((service, idx) => (
              <MosaicTile
                key={service.id}
                service={service}
                category={categories.find(c => c.id === service.category_id)}
                size={idx % 3 === 0 ? 'large' : 'medium'}
                isSelected={selectedServices.some(s => s.id === service.id)}
                onToggleSelect={toggleServiceSelection}
              />
            ))}
          </div>
        </section>

        {/* Bottom Section: Niche & More */}
        {nicheServices.length > 0 && (
          <section className="mb-12 pt-12 border-t border-gray-100">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900">Specialized Services</h3>
              <p className="text-gray-500 mt-1">For those unique needs that require expert attention.</p>
            </div>

            <div className="mosaic-grid grayscale hover:grayscale-0 transition-all duration-700">
              {nicheServices.map((service) => (
                <MosaicTile
                  key={service.id}
                  service={service}
                  category={categories.find(c => c.id === service.category_id)}
                  size="small"
                  isSelected={selectedServices.some(s => s.id === service.id)}
                  onToggleSelect={toggleServiceSelection}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Floating Action Bar */}
      <FloatingBookingBar
        selectedCount={selectedServices.length}
        onContinue={handleContinueBooking}
      />

      <Footer />

      <ServiceBookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        user={user}
        initialServiceId={null}
      />
    </div>
  )
}
