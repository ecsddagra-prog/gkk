import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import Link from 'next/link'
import axios from 'axios'

export default function ProviderRegister({ user }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [locating, setLocating] = useState(false)
  const [categories, setCategories] = useState([])
  const [services, setServices] = useState([])
  const [formData, setFormData] = useState({
    business_name: '',
    business_address: '',
    business_lat: null,
    business_lng: null,
    business_category_id: '',
    business_subcategory_id: '',
    gst_number: ''
  })
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    const checkAndLoad = async () => {
      if (!user) {
        console.log('No user found, redirecting to login')
        router.push('/login')
        return
      }

      console.log('User authenticated:', user.id)

      try {
        // Check if user already has a provider record
        const { data: providerData, error: providerError } = await supabase
          .from('providers')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (providerData && !providerError) {
          console.log('User already has provider record, redirecting to provider dashboard')
          toast.info('You are already registered as a provider')
          router.replace('/provider/dashboard')
          return
        }

        // If no provider record, load categories for registration
        await loadCategories()
        setPageLoading(false)
      } catch (error) {
        console.error('Error checking provider status:', error)
        // If error is "not found", that's okay - user is not a provider yet
        await loadCategories()
        setPageLoading(false)
      }
    }

    checkAndLoad()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadCategories = async () => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      console.log('Loading categories, token:', token ? 'present' : 'missing')

      const { data } = await axios.get('/api/catalog/bootstrap', {
        headers: { Authorization: `Bearer ${token}` }
      })

      console.log('Bootstrap API response:', data)
      console.log('Categories count:', data.categories?.length || 0)

      setCategories(data.categories || [])
    } catch (error) {
      console.error('Error loading categories:', error)
      console.error('Error response:', error.response?.data)
      toast.error('Failed to load categories')
    }
  }

  const loadServices = async (categoryId) => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const { data } = await axios.get('/api/catalog/services', {
        params: { category_id: categoryId },
        headers: { Authorization: `Bearer ${token}` }
      })
      setServices(data.services || [])
    } catch (error) {
      console.error('Error loading services:', error)
      toast.error('Failed to load services')
    }
  }

  const autoLocateBusiness = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
        const data = await response.json()

        setFormData(prev => ({
          ...prev,
          business_address: data.display_name || prev.business_address,
          business_lat: latitude,
          business_lng: longitude
        }))

        toast.success('Business location detected')
      } catch (error) {
        console.error('Location detection error:', error)
        toast.error('Failed to fetch address')
      } finally {
        setLocating(false)
      }
    }, () => {
      toast.error('Unable to fetch your location')
      setLocating(false)
    }, { enableHighAccuracy: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.business_category_id || !formData.business_subcategory_id) {
      toast.error('Please select your business category and service')
      return
    }
    setLoading(true)

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const payload = {
        business_name: formData.business_name.trim(),
        business_address: formData.business_address.trim(),
        business_lat: formData.business_lat || null,
        business_lng: formData.business_lng || null,
        business_category_id: formData.business_category_id,
        business_subcategory_id: formData.business_subcategory_id,
        gst_number: formData.gst_number?.trim() || null
      }

      const response = await axios.post('/api/providers/register', payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      console.log('Provider registration successful:', response.data)

      // Refresh the session to get updated user role
      await supabase.auth.refreshSession()

      toast.success('Business profile saved! Redirecting to provider dashboard.')

      // Use setTimeout to ensure toast is visible before redirect
      setTimeout(() => {
        router.push('/provider/dashboard')
      }, 500)
    } catch (error) {
      console.error('Registration error:', error)
      console.error('Error details:', error.response?.data)
      toast.error(error.response?.data?.error || 'Failed to register as provider')
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading) {
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
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-blue-600">Become a Provider</h1>
            <div></div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-700">
            Step 1: Add your business details. After this, you&apos;ll upload verification documents and bank info.
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Name *</label>
              <input
                type="text"
                required
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g. Spark Cleaners"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Address *</label>
              <textarea
                required
                rows={3}
                value={formData.business_address}
                onChange={(e) => setFormData({ ...formData, business_address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Auto-detected or type your full address"
              />
              <button
                type="button"
                onClick={autoLocateBusiness}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
                disabled={locating}
              >
                {locating ? 'Detecting location...' : 'Use my current location'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Category *</label>
                <select
                  required
                  value={formData.business_category_id}
                  onChange={(e) => {
                    setFormData({ ...formData, business_category_id: e.target.value, business_subcategory_id: '' })
                    if (e.target.value) {
                      loadServices(e.target.value)
                    } else {
                      setServices([])
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.icon ? `${category.icon} ` : ''}{category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service / Subcategory *</label>
                <select
                  required
                  value={formData.business_subcategory_id}
                  onChange={(e) => setFormData({ ...formData, business_subcategory_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  disabled={!formData.business_category_id || services.length === 0}
                >
                  <option value="">
                    {formData.business_category_id
                      ? services.length === 0
                        ? 'No services available'
                        : 'Select service'
                      : 'Choose a category first'}
                  </option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GST Number (Optional)</label>
              <input
                type="text"
                value={formData.gst_number}
                onChange={(e) => setFormData({ ...formData, gst_number: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                maxLength={15}
                placeholder="15-digit GSTIN"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save & Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
