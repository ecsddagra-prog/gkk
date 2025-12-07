import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function AdminCityServices({ user }) {
  const router = useRouter()
  const [cities, setCities] = useState([])
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCity, setSelectedCity] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [cityServices, setCityServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    checkAdminAccess()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    if (selectedCity) {
      loadCityServices()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCity])

  const checkAdminAccess = async () => {
    try {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
        router.push('/dashboard')
        return
      }
      loadData()
    } catch (error) {
      router.push('/dashboard')
    }
  }

  const loadData = async () => {
    try {
      // Load cities
      const { data: citiesData } = await supabase
        .from('cities')
        .select('*')
        .order('name')

      setCities(citiesData || [])
      if (citiesData && citiesData.length > 0) {
        setSelectedCity(citiesData[0].id)
      }

      // Load service categories
      const { data: categoriesData } = await supabase
        .from('service_categories')
        .select('*')
        .order('name')

      setCategories(categoriesData || [])

      // Load services
      const { data: servicesData } = await supabase
        .from('services')
        .select('*, category:service_categories(*)')
        .eq('is_active', true)
        .order('name')

      setServices(servicesData || [])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const loadCityServices = async () => {
    if (!selectedCity) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        toast.error('Authentication required')
        router.push('/login')
        return
      }

      const { data } = await axios.get(`/api/admin/city-services?city_id=${selectedCity}`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      })
      setCityServices(data.city_services || [])
    } catch (error) {
      console.error('Error loading city services:', error)
      if (error.response?.status === 403) {
        toast.error('Admin access required')
        router.push('/dashboard')
      } else {
        toast.error('Failed to load city services')
      }
    }
  }

  const toggleService = async (serviceId, currentStatus) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        toast.error('Authentication required')
        router.push('/login')
        return
      }

      await axios.post('/api/admin/city-services', {
        city_id: selectedCity,
        service_id: serviceId,
        is_enabled: !currentStatus
      }, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      })

      toast.success(`Service ${!currentStatus ? 'enabled' : 'disabled'}`)
      loadCityServices()
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Admin access required')
        router.push('/dashboard')
      } else {
        toast.error(error.response?.data?.error || 'Failed to update service')
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-700">
                ← Back
              </Link>
              <h1 className="text-2xl font-bold text-blue-600">City Services Management</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select City</label>
              <select
                value={selectedCity || ''}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select a city</option>
                {cities.map(city => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {selectedCity ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                Services for {cities.find(c => c.id === selectedCity)?.name}
              </h2>
              <div className="space-y-2">
                {services
                  .filter(service => !selectedCategory || service.category_id === selectedCategory)
                  .map(service => {
                    const cityService = cityServices.find(cs => cs.service_id === service.id)
                    const isEnabled = cityService?.is_enabled || false

                    return (
                      <div
                        key={service.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="font-semibold">{service.name}</div>
                          <div className="text-sm text-gray-600">{service.category?.name}</div>
                        </div>
                        <button
                          onClick={() => toggleService(service.id, isEnabled)}
                          className={`px-4 py-2 rounded-lg ${isEnabled
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                            }`}
                        >
                          {isEnabled ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600">Please select a city to manage services</p>
          </div>
        )}
      </div>
    </div>
  )
}

