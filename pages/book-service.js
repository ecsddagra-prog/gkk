import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function BookService({ user }) {
  const router = useRouter()
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [cities, setCities] = useState([])
  const [addresses, setAddresses] = useState([])
  const [profile, setProfile] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedServiceId, setSelectedServiceId] = useState(null)
  const [selectedSubServiceIds, setSelectedSubServiceIds] = useState([]) // Array for multiple sub-services
  const [selectedSubSubServiceIds, setSelectedSubSubServiceIds] = useState([]) // Array for addons
  const [selectedCity, setSelectedCity] = useState(null)
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [cityAutoDetecting, setCityAutoDetecting] = useState(false)
  const [servicesLoading, setServicesLoading] = useState(false)
  const [formData, setFormData] = useState({
    service_address: '',
    city: '',
    state: '',
    pincode: '',
    service_lat: '',
    service_lng: '',
    scheduled_date: '',
    scheduled_time: '',
    user_quoted_price: ''
  })
  const [bookingFor, setBookingFor] = useState('self')
  const [otherContact, setOtherContact] = useState({ name: '', phone: '' })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [providerCount, setProviderCount] = useState({ count: 0, enabled: false })
  const [showQuoteField, setShowQuoteField] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const determineDefaultCity = (citiesList, profileData, addressesData) => {
    const byProfile = profileData?.current_city_id || profileData?.default_city_id
    if (byProfile && citiesList.some(city => city.id === byProfile)) {
      return byProfile
    }

    const defaultAddress = (addressesData || []).find(addr => addr.is_default)
    if (defaultAddress) {
      const cityMatch = citiesList.find(city => city.name.toLowerCase() === defaultAddress.city?.toLowerCase())
      if (cityMatch) return cityMatch.id
    }

    return citiesList[0]?.id || null
  }

  const loadData = async () => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const { data } = await axios.get('/api/catalog/bootstrap', {
        headers: { Authorization: `Bearer ${token}` }
      })

      setCities(data.cities || [])
      setCategories(data.categories || [])
      setProfile(data.profile || null)
      setAddresses(data.addresses || [])

      const defaultCityId = determineDefaultCity(data.cities || [], data.profile, data.addresses)
      setSelectedCity(defaultCityId)

      if (data.addresses && data.addresses.length > 0) {
        const defaultAddress = data.addresses.find(addr => addr.is_default) || data.addresses[0]
        handleAddressSelect(defaultAddress)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error(error.response?.data?.error || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    if (selectedCity && selectedCategory) {
      loadServices()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCity, selectedCategory])

  const loadServices = async () => {
    if (!selectedCity || !selectedCategory) return
    setServicesLoading(true)
    setServices([])

    try {
      console.log('Loading services for:', { city_id: selectedCity, category_id: selectedCategory })

      const { data } = await axios.get('/api/services', {
        params: {
          city_id: selectedCity,
          category_id: selectedCategory
        }
      })

      console.log('Services loaded:', data.services)

      if (data.services && data.services.length > 0) {
        setServices(data.services)
        console.log(`✅ Loaded ${data.services.length} services for this city`)
      } else {
        setServices([])
        console.warn('⚠️ No services enabled for this city and category')
        toast('No services available in this city for the selected category', {
          icon: 'ℹ️',
          duration: 4000
        })
      }
    } catch (error) {
      console.error('❌ Error loading services:', error)
      setServices([])
      toast.error(error.response?.data?.error || 'Failed to load services')
    } finally {
      setServicesLoading(false)
    }
  }

  useEffect(() => {
    if (selectedServiceId && selectedCity) {
      fetchProviderCount()
    } else {
      setProviderCount({ count: 0, enabled: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedServiceId, selectedCity])

  const fetchProviderCount = async () => {
    try {
      const { data } = await axios.get('/api/bookings/provider-count', {
        params: {
          service_id: selectedServiceId,
          city_id: selectedCity
        }
      })
      setProviderCount(data)
    } catch (error) {
      console.error('Error fetching provider count:', error)
    }
  }

  const handleAddressSelect = (address) => {
    if (!address) return
    setSelectedAddress(address.id)
    setFormData(prev => ({
      ...prev,
      service_address: `${address.address_line1}${address.address_line2 ? `, ${address.address_line2}` : ''}, ${address.city}, ${address.pincode || ''}`,
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || '',
      service_lat: address.latitude,
      service_lng: address.longitude
    }))

    const matchingCity = cities.find(city => city.name?.toLowerCase() === address.city?.toLowerCase())
    if (matchingCity && matchingCity.id !== selectedCity) {
      setSelectedCity(matchingCity.id)
    }
  }

  const autoDetectCityFromLocation = useCallback(() => {
    if (cityAutoDetecting || typeof window === 'undefined') return
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }

    if (!cities.length) {
      toast.error('No cities configured yet')
      return
    }

    setCityAutoDetecting(true)
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
        const data = await response.json()
        const address = data.address || {}
        const detectedCityName = address.city || address.town || address.village || address.state_district

        if (!detectedCityName) {
          toast.error('Unable to detect your city from location')
          setCityAutoDetecting(false)
          return
        }

        const matchedCity = cities.find(city => city.name?.toLowerCase() === detectedCityName.toLowerCase())
        if (!matchedCity) {
          toast.error(`Services are not available in ${detectedCityName} yet`)
          // Still fill in the address fields even if city isn't in our list
          setFormData(prev => ({
            ...prev,
            service_address: data.display_name || '',
            city: detectedCityName,
            state: address.state || '',
            pincode: address.postcode || '',
            service_lat: latitude,
            service_lng: longitude
          }))
          setCityAutoDetecting(false)
          return
        }

        setSelectedCity(prev => prev || matchedCity.id)
        setFormData(prev => ({
          ...prev,
          service_address: data.display_name || '',
          city: detectedCityName,
          state: address.state || '',
          pincode: address.postcode || '',
          service_lat: latitude,
          service_lng: longitude
        }))

        toast.success('Location detected and address fields filled')

        if (user?.id) {
          const { error: updateError } = await supabase
            .from('users')
            .update({
              current_city_id: matchedCity.id,
              current_lat: latitude,
              current_lng: longitude
            })
            .eq('id', user.id)

          if (updateError) {
            console.warn('Failed to persist user location', updateError)
          }
        }
      } catch (error) {
        console.error('Auto detect city error:', error)
        toast.error('Failed to auto-detect city. Please enter address manually.')
      } finally {
        setCityAutoDetecting(false)
      }
    }, (error) => {
      console.error('Geolocation error:', error)
      if (error.code === error.PERMISSION_DENIED) {
        toast.error('Location permission denied. Please enable location access or enter address manually.')
      } else {
        toast.error('Unable to fetch your current location. Please enter address manually.')
      }
      setCityAutoDetecting(false)
    }, { enableHighAccuracy: true })
  }, [cityAutoDetecting, cities, user?.id])

  useEffect(() => {
    if (!loading && !selectedCity && cities.length > 0) {
      autoDetectCityFromLocation()
    }
  }, [loading, selectedCity, cities.length, autoDetectCityFromLocation])

  const activeService = useMemo(() => services.find(service => service.id === selectedServiceId), [services, selectedServiceId])
  const activeSubServices = useMemo(() => {
    if (!activeService?.sub_services) return []
    return activeService.sub_services.filter(sub => selectedSubServiceIds.includes(sub.id))
  }, [activeService, selectedSubServiceIds])

  const activeSubSubServices = useMemo(() => {
    const allSubSubServices = []
    activeSubServices.forEach(subService => {
      if (subService.sub_subservices) {
        const selected = subService.sub_subservices.filter(subSub => selectedSubSubServiceIds.includes(subSub.id))
        allSubSubServices.push(...selected)
      }
    })
    return allSubSubServices
  }, [activeSubServices, selectedSubSubServiceIds])

  const chargeSummary = useMemo(() => {
    let totalBase = 0

    if (activeSubServices.length > 0) {
      // Sum up sub-service prices
      totalBase = activeSubServices.reduce((sum, sub) => sum + (parseFloat(sub.base_charge) || 0), 0)

      // Add addon prices
      totalBase += activeSubSubServices.reduce((sum, subSub) => sum + (parseFloat(subSub.base_charge) || 0), 0)

      return {
        base: totalBase,
        hourly: null,
        min: null,
        max: null
      }
    }

    // If no sub-services selected, use main service price
    return {
      base: activeService?.base_price ?? 0,
      hourly: null,
      min: activeService?.min_price ?? null,
      max: activeService?.max_price ?? null
    }
  }, [activeService, activeSubServices, activeSubSubServices])

  const handleServiceSelect = (service) => {
    setSelectedServiceId(service.id)
    setSelectedSubServiceIds([])
    setSelectedSubSubServiceIds([])
  }

  const handleSubServiceToggle = (subServiceId) => {
    setSelectedSubServiceIds(prev => {
      if (prev.includes(subServiceId)) {
        // Remove sub-service and its addons
        const subService = activeService.sub_services.find(s => s.id === subServiceId)
        if (subService?.sub_subservices) {
          const addonIds = subService.sub_subservices.map(a => a.id)
          setSelectedSubSubServiceIds(prevAddons => prevAddons.filter(id => !addonIds.includes(id)))
        }
        return prev.filter(id => id !== subServiceId)
      } else {
        return [...prev, subServiceId]
      }
    })
  }

  const handleSubSubServiceToggle = (subSubServiceId) => {
    setSelectedSubSubServiceIds(prev => {
      if (prev.includes(subSubServiceId)) {
        return prev.filter(id => id !== subSubServiceId)
      } else {
        return [...prev, subSubServiceId]
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedServiceId || !selectedCity || !formData.service_address) {
      toast.error('Please fill all required fields')
      return
    }

    if (bookingFor === 'other' && (!otherContact.name || !otherContact.phone)) {
      toast.error('Please add name and phone for the person you are booking for')
      return
    }

    setSubmitting(true)

    try {
      const { data } = await axios.post('/api/bookings/create', {
        user_id: user.id,
        service_id: selectedServiceId,
        city_id: selectedCity,
        address_id: selectedAddress,
        service_address: formData.service_address,
        service_lat: formData.service_lat,
        service_lng: formData.service_lng,
        scheduled_date: formData.scheduled_date && formData.scheduled_time
          ? `${formData.scheduled_date}T${formData.scheduled_time}:00`
          : null,
        user_quoted_price: formData.user_quoted_price || null,
        sub_service_ids: selectedSubServiceIds,
        sub_subservice_ids: selectedSubSubServiceIds,
        base_charge: chargeSummary.base,
        hourly_charge: chargeSummary.hourly,
        for_whom: bookingFor,
        other_contact: bookingFor === 'other' ? otherContact : null
      })

      toast.success('Booking created successfully!')
      router.push(`/booking/${data.booking.id}`)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create booking')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRateQuote = async () => {
    if (!selectedServiceId || !selectedCity || !formData.service_address) {
      toast.error('Please select service, city and address')
      return
    }

    setQuoteLoading(true)
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token

      const payload = {
        service_id: selectedServiceId,
        sub_service_id: selectedSubServiceIds.length > 0 ? selectedSubServiceIds[0] : null,
        city_id: selectedCity,
        address_id: selectedAddress,
        requested_price: formData.user_quoted_price || null,
        details: {
          service_address: formData.service_address,
          service_lat: formData.service_lat,
          service_lng: formData.service_lng,
          scheduled_date: formData.scheduled_date && formData.scheduled_time
            ? `${formData.scheduled_date}T${formData.scheduled_time}:00`
            : null,
          for_whom: bookingFor,
          other_contact: bookingFor === 'other' ? otherContact : null,
          sub_service_names: activeSubServices.map(s => s.name).join(', ') || activeService?.name,
          sub_service_ids: selectedSubServiceIds,
          sub_subservice_ids: selectedSubSubServiceIds,
          base_charge: chargeSummary.base,
          hourly_charge: chargeSummary.hourly
        }
      }

      const { data } = await axios.post('/api/rate-quotes', payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      toast.success('Rate quote requested! Countdown started.')
      router.push(`/rate-quote/${data.rate_quote.id}`)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to request rate quote')
    } finally {
      setQuoteLoading(false)
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
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-blue-600">Book a Service</h1>
            <div></div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* City Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select City *</label>
            <select
              required
              value={selectedCity || ''}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select City</option>
              {cities.map(city => (
                <option key={city.id} value={city.id}>{city.name}</option>
              ))}
            </select>

          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Service Category *</label>
            <select
              required
              value={selectedCategory || ''}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setSelectedServiceId(null)
                setSelectedSubServiceIds([])
                setSelectedSubSubServiceIds([])
                setServices([])
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {/* Optional: Show selected category image/icon preview */}
            {selectedCategory && (() => {
              const cat = categories.find(c => c.id === selectedCategory)
              if (cat?.image_url) {
                return <img src={cat.image_url} alt={cat.name} className="mt-2 h-16 w-16 object-cover rounded-lg" />
              }
              return null
            })()}
          </div>

          {/* Service Selection */}
          {selectedCategory && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Service *</label>

              {!selectedCity ? (
                <div className="w-full px-3 py-8 border border-gray-300 rounded-lg bg-blue-50 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-sm text-gray-700 font-medium mb-1">Please select your city to see available services</p>
                  <p className="text-xs text-gray-600">Choose a city from the dropdown above</p>
                </div>
              ) : servicesLoading ? (
                <div className="w-full px-3 py-8 border border-gray-300 rounded-lg bg-gray-50 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Loading services...</p>
                </div>
              ) : services.length === 0 ? (
                <div className="w-full px-3 py-8 border border-gray-300 rounded-lg bg-yellow-50 text-center">
                  <p className="text-sm text-gray-700 mb-2">⚠️ No services available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map(service => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => handleServiceSelect(service)}
                      className={`p-4 border rounded-lg text-left transition ${selectedServiceId === service.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                        }`}
                    >
                      <div className="font-semibold text-gray-900">{service.name}</div>
                      {service.description && (
                        <div className="text-sm text-gray-600 mt-1">{service.description}</div>
                      )}
                      {service.base_price && (
                        <div className="text-blue-600 font-semibold mt-2">₹{service.base_price}</div>
                      )}
                      {service.sub_services && service.sub_services.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">👉 {service.sub_services.length} options available</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Provider Count Notification */}
          {selectedServiceId && providerCount.enabled && providerCount.count > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 animate-pulse">
              <span className="text-2xl">👨‍🔧</span>
              <div>
                <p className="text-green-800 font-medium">
                  {providerCount.count} {providerCount.count === 1 ? 'provider is' : 'providers are'} online right now!
                </p>
                <p className="text-green-600 text-sm">
                  Book now for a quick response.
                </p>
              </div>
            </div>
          )}

          {/* Sub-Service Selection */}
          {selectedServiceId && activeService && activeService.sub_services && activeService.sub_services.length > 0 && (
            <div className="border-t pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Options for {activeService.name} *
              </label>
              <div className="space-y-3">
                {activeService.sub_services.map(subService => (
                  <div key={subService.id} className="border rounded-lg p-4">
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSubServiceIds.includes(subService.id)}
                        onChange={() => handleSubServiceToggle(subService.id)}
                        className="mt-1 mr-3 h-4 w-4 text-blue-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-gray-900">{subService.name}</span>
                            {subService.description && (
                              <p className="text-sm text-gray-600 mt-1">{subService.description}</p>
                            )}
                          </div>
                          <span className="text-blue-600 font-semibold ml-4">₹{subService.base_charge}</span>
                        </div>

                        {/* Sub-Sub-Services (Addons) */}
                        {selectedSubServiceIds.includes(subService.id) && subService.sub_subservices && subService.sub_subservices.length > 0 && (
                          <div className="mt-4 ml-6 pl-4 border-l-2 border-gray-200 space-y-2">
                            <p className="text-xs font-medium text-gray-600 uppercase mb-2">Add-ons for {subService.name}</p>
                            {subService.sub_subservices.map(addon => (
                              <label key={addon.id} className="flex items-center cursor-pointer group">
                                <input
                                  type="checkbox"
                                  checked={selectedSubSubServiceIds.includes(addon.id)}
                                  onChange={() => handleSubSubServiceToggle(addon.id)}
                                  className="mr-2 h-4 w-4 text-blue-600"
                                />
                                <div className="flex items-center justify-between flex-1">
                                  <span className="text-sm text-gray-700 group-hover:text-gray-900">{addon.name}</span>
                                  <span className="text-sm text-blue-600 font-medium">+₹{addon.base_charge}</span>
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price Summary */}
          {selectedServiceId && (activeSubServices.length > 0 || activeService?.base_price) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Price Summary</h3>
              {activeSubServices.length > 0 ? (
                <div className="space-y-1 text-sm">
                  {activeSubServices.map(sub => (
                    <div key={sub.id} className="flex justify-between text-gray-700">
                      <span>• {sub.name}</span>
                      <span>₹{sub.base_charge}</span>
                    </div>
                  ))}
                  {activeSubSubServices.length > 0 && (
                    <>
                      <div className="text-xs text-gray-600 mt-2 mb-1">Add-ons:</div>
                      {activeSubSubServices.map(addon => (
                        <div key={addon.id} className="flex justify-between text-gray-600 text-xs pl-4">
                          <span>• {addon.name}</span>
                          <span>₹{addon.base_charge}</span>
                        </div>
                      ))}
                    </>
                  )}
                  <div className="border-t border-blue-300 mt-2 pt-2 flex justify-between font-bold text-gray-900">
                    <span>Estimated Rate:</span>
                    <span>₹{chargeSummary.base}</span>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Estimated Rate:</span>
                  <span className="font-bold text-blue-600">₹{activeService?.base_price}</span>
                </div>
              )}
            </div>
          )}

          {/* Address Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Service Address *</label>
            {addresses.length > 0 ? (
              <div className="space-y-2 mb-4">
                {addresses.map(address => (
                  <button
                    key={address.id}
                    type="button"
                    onClick={() => handleAddressSelect(address)}
                    className={`w-full text-left p-3 border rounded-lg ${selectedAddress === address.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                      }`}
                  >
                    <div className="font-medium">{address.address_type}</div>
                    <div className="text-sm text-gray-600">
                      {address.address_line1}, {address.city}, {address.pincode}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600 mb-2">No saved addresses. Please add an address.</p>
            )}
            <button
              type="button"
              onClick={autoDetectCityFromLocation}
              disabled={cityAutoDetecting}
              className="mb-3 flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
            >
              {cityAutoDetecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  Detecting location...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Use my current location
                </>
              )}
            </button>
            <textarea
              required
              value={formData.service_address}
              onChange={(e) => setFormData({ ...formData, service_address: e.target.value })}
              placeholder="House/Flat No., Building Name, Street, Landmark"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
              rows={2}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="City"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="State"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Pincode</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="Pincode"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Booking For *</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={bookingFor === 'self'}
                  onChange={() => setBookingFor('self')}
                />
                Self
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={bookingFor === 'other'}
                  onChange={() => setBookingFor('other')}
                />
                Someone Else
              </label>
            </div>
            {bookingFor === 'other' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <input
                  type="text"
                  placeholder="Person's Name"
                  value={otherContact.name}
                  onChange={(e) => setOtherContact({ ...otherContact, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  type="tel"
                  placeholder="Person's Phone"
                  value={otherContact.phone}
                  onChange={(e) => setOtherContact({ ...otherContact, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
            )}
          </div>

          {/* Scheduled Date & Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date & Time (Optional)</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <input
                  type="date"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <select
                  value={formData.scheduled_time}
                  onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                  disabled={!formData.scheduled_date}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select time</option>
                  {Array.from({ length: 288 }, (_, i) => {
                    const hours = Math.floor(i / 12)
                    const minutes = (i % 12) * 5
                    const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
                    return <option key={timeStr} value={timeStr}>{timeStr}</option>
                  })}
                </select>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Leave empty to book as soon as possible</p>
          </div>

          {/* Quote Your Own Rate Toggle */}
          <div>
            {!showQuoteField ? (
              <button
                type="button"
                onClick={() => setShowQuoteField(true)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Quote Your Own Rate
              </button>
            ) : (
              <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Your Preferred Price</label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuoteField(false)
                      setFormData({ ...formData, user_quoted_price: '' })
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.user_quoted_price}
                  onChange={(e) => setFormData({ ...formData, user_quoted_price: e.target.value })}
                  placeholder="Enter your preferred price"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <p className="text-xs text-gray-600 mt-2">Provider can accept or counter your offer</p>
              </div>
            )}
          </div>

          {/* Primary Action */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-6 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 shadow-lg transition-all"
          >
            {submitting ? 'Creating Booking...' : 'Create Booking Now'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="text-sm text-gray-500 font-medium">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Secondary Action */}
          <button
            type="button"
            disabled={quoteLoading}
            onClick={handleRateQuote}
            className="w-full px-6 py-3 border-2 border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 disabled:opacity-50 transition-colors"
          >
            {quoteLoading ? 'Requesting...' : 'Request Rate Quote'}
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            Get competitive quotes from multiple providers
          </p>
        </form>
      </div >
    </div >
  )
}

