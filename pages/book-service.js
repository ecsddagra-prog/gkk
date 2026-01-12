import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { MapPin, Calendar, Clock, ChevronRight, Trash2, Plus } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function BookService({ user }) {
  const router = useRouter()
  const { services: servicesQuery } = router.query

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Review, 2: Details

  // Data State
  const [selectedServices, setSelectedServices] = useState([])
  const [addresses, setAddresses] = useState([])
  const [cities, setCities] = useState([])

  // Selection State
  const [serviceConfigs, setServiceConfigs] = useState({}) // { [serviceId]: { subServiceIds: [], subSubServiceIds: [] } }
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=' + encodeURIComponent(router.asPath))
      return
    }
    if (router.isReady) {
      loadInitialData()
    }
  }, [user, router.isReady, servicesQuery])

  const loadInitialData = async () => {
    try {
      setLoading(true)

      // 1. Load Services from Query
      if (servicesQuery) {
        const { data } = await axios.get(`/api/services/bulk?ids=${servicesQuery}`)
        setSelectedServices(data.services || [])

        // Initialize configs
        const initialConfigs = {}
        data.services.forEach(s => {
          initialConfigs[s.id] = { subServiceIds: [], subSubServiceIds: [] }
        })
        setServiceConfigs(initialConfigs)
      }

      // 2. Load User Data (Addresses, Cities)
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const { data: bootstrapData } = await axios.get('/api/catalog/bootstrap', {
        headers: { Authorization: `Bearer ${token}` }
      })

      setAddresses(bootstrapData.addresses || [])
      setCities(bootstrapData.cities || [])

      const defaultAddr = bootstrapData.addresses?.find(a => a.is_default) || bootstrapData.addresses?.[0]
      if (defaultAddr) setSelectedAddressId(defaultAddr.id)

    } catch (error) {
      console.error('Error loading checkout data:', error)
      toast.error('Failed to prepare checkout')
    } finally {
      setLoading(false)
    }
  }

  const toggleSubService = (serviceId, subId) => {
    setServiceConfigs(prev => {
      const config = prev[serviceId] || { subServiceIds: [], subSubServiceIds: [] }
      const isSelected = config.subServiceIds.includes(subId)

      let nextSubIds = []
      let nextSubSubIds = [...config.subSubServiceIds]

      if (isSelected) {
        nextSubIds = config.subServiceIds.filter(id => id !== subId)
        // Also remove sub-sub-services belonging to this sub-service
        const subService = selectedServices.find(s => s.id === serviceId)?.sub_services?.find(ss => ss.id === subId)
        if (subService?.sub_subservices) {
          const addonIds = subService.sub_subservices.map(a => a.id)
          nextSubSubIds = nextSubSubIds.filter(id => !addonIds.includes(id))
        }
      } else {
        nextSubIds = [...config.subServiceIds, subId]
      }

      return {
        ...prev,
        [serviceId]: { ...config, subServiceIds: nextSubIds, subSubServiceIds: nextSubSubIds }
      }
    })
  }

  const toggleSubSubService = (serviceId, subSubId) => {
    setServiceConfigs(prev => {
      const config = prev[serviceId] || { subServiceIds: [], subSubServiceIds: [] }
      const isSelected = config.subSubServiceIds.includes(subSubId)
      const nextSubSubIds = isSelected
        ? config.subSubServiceIds.filter(id => id !== subSubId)
        : [...config.subSubServiceIds, subSubId]

      return {
        ...prev,
        [serviceId]: { ...config, subSubServiceIds: nextSubSubIds }
      }
    })
  }

  const removeService = (serviceId) => {
    setSelectedServices(prev => {
      const updated = prev.filter(s => s.id !== serviceId)
      if (updated.length === 0) {
        router.push('/')
      }
      return updated
    })
  }

  const calculateServicePrice = (service) => {
    const config = serviceConfigs[service.id] || { subServiceIds: [], subSubServiceIds: [] }
    if (config.subServiceIds.length === 0) return service.base_price || 0

    let total = 0
    config.subServiceIds.forEach(subId => {
      const sub = service.sub_services?.find(s => s.id === subId)
      total += (sub?.base_charge || 0)
    })
    config.subSubServiceIds.forEach(subSubId => {
      service.sub_services?.forEach(sub => {
        const subSub = sub.sub_subservices?.find(ss => ss.id === subSubId)
        if (subSub) total += (subSub.base_charge || 0)
      })
    })
    return total
  }

  const totalPrice = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + calculateServicePrice(s), 0)
  }, [selectedServices, serviceConfigs])

  const handleCreateBookings = async () => {
    if (!selectedAddressId) return toast.error('Please select an address')
    setSubmitting(true)
    try {
      const address = addresses.find(a => a.id === selectedAddressId)
      const city = cities.find(c => c.name.toLowerCase() === address.city.toLowerCase())

      // Create bookings sequentially for now (could be parallel)
      const results = []
      for (const service of selectedServices) {
        const config = serviceConfigs[service.id]
        const payload = {
          user_id: user.id,
          service_id: service.id,
          city_id: city?.id || null,
          address_id: selectedAddressId,
          service_address: `${address.address_line1}, ${address.city}`,
          service_lat: address.latitude,
          service_lng: address.longitude,
          scheduled_date: scheduledDate && scheduledTime ? `${scheduledDate}T${scheduledTime}:00` : null,
          sub_service_ids: config.subServiceIds,
          sub_subservice_ids: config.subSubServiceIds,
        }
        const { data } = await axios.post('/api/bookings/create', payload)
        results.push(data.booking)
      }

      toast.success(`Successfully booked ${results.length} services!`)
      router.push('/bookings')
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Booking failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRateQuote = async () => {
    if (!selectedAddressId) return toast.error('Please select an address')
    if (selectedServices.length === 0) return toast.error('Please select at least one service')

    setQuoteLoading(true)
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const address = addresses.find(a => a.id === selectedAddressId)
      const city = cities.find(c => c.name.toLowerCase() === address.city.toLowerCase())

      // For now, create rate quote for the first service
      // In future, could support multiple services or create multiple quotes
      const service = selectedServices[0]
      const config = serviceConfigs[service.id] || { subServiceIds: [], subSubServiceIds: [] }

      // Build sub-service names for details
      let subServiceNames = service.name
      if (config.subServiceIds.length > 0) {
        const selectedSubs = service.sub_services?.filter(sub => config.subServiceIds.includes(sub.id)) || []
        if (selectedSubs.length > 0) {
          subServiceNames = selectedSubs.map(s => s.name).join(', ')
        }
      }

      const payload = {
        service_id: service.id,
        sub_service_id: config.subServiceIds.length > 0 ? config.subServiceIds[0] : null,
        city_id: city?.id || null,
        address_id: selectedAddressId,
        requested_price: null,
        details: {
          service_address: `${address.address_line1}, ${address.city}`,
          service_lat: address.latitude,
          service_lng: address.longitude,
          scheduled_date: scheduledDate && scheduledTime ? `${scheduledDate}T${scheduledTime}:00` : null,
          for_whom: 'self',
          other_contact: null,
          sub_service_names: subServiceNames,
          sub_service_ids: config.subServiceIds,
          sub_subservice_ids: config.subSubServiceIds,
          base_charge: calculateServicePrice(service),
          hourly_charge: null
        }
      }

      const { data } = await axios.post('/api/rate-quotes', payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      toast.success('Rate quote requested!')
      router.push(`/rate-quote/${data.rate_quote.id}`)
    } catch (error) {
      console.error('Rate quote error:', error)
      toast.error(error.response?.data?.error || 'Failed to request rate quote')
    } finally {
      setQuoteLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold">Initializing Checkout...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      <Header user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Left Side: Services & Configuration */}
          <div className="flex-1 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Review <span className="text-purple-600">Basket</span></h2>
              <p className="text-gray-500 font-bold">{selectedServices.length} items</p>
            </div>

            {selectedServices.map(service => (
              <div key={service.id} className="glass-premium bg-white/70 rounded-3xl p-6 border border-white shadow-xl hover:shadow-2xl transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-4 items-center">
                    <div className="text-4xl bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner">
                      {service.category?.icon || '🔧'}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900">{service.name}</h3>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{service.category?.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeService(service.id)}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Options / Sub-services */}
                {service.sub_services?.length > 0 && (
                  <div className="space-y-4">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-tighter">Customize this service</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {service.sub_services.map(sub => (
                        <div key={sub.id} className="space-y-2">
                          <button
                            onClick={() => toggleSubService(service.id, sub.id)}
                            className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center justify-between ${serviceConfigs[service.id]?.subServiceIds.includes(sub.id)
                              ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-100'
                              : 'bg-white border-gray-100 text-gray-700 hover:border-purple-200'
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${serviceConfigs[service.id]?.subServiceIds.includes(sub.id) ? 'bg-white/20 border-white' : 'border-gray-200'}`}>
                                {serviceConfigs[service.id]?.subServiceIds.includes(sub.id) && <ChevronRight className="w-3 h-3" />}
                              </div>
                              <span className="font-bold text-sm">{sub.name}</span>
                            </div>
                            <span className={`text-sm font-black ${serviceConfigs[service.id]?.subServiceIds.includes(sub.id) ? 'text-white' : 'text-purple-600'}`}>
                              ₹{sub.base_charge}
                            </span>
                          </button>

                          {/* Addons for this sub-service */}
                          {serviceConfigs[service.id]?.subServiceIds.includes(sub.id) && sub.sub_subservices?.length > 0 && (
                            <div className="ml-6 space-y-2 pt-1 uppercase text-[10px] tracking-widest font-black text-gray-400">
                              <p>Add-ons</p>
                              {sub.sub_subservices.map(addon => (
                                <button
                                  key={addon.id}
                                  onClick={() => toggleSubSubService(service.id, addon.id)}
                                  className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all ${serviceConfigs[service.id]?.subSubServiceIds.includes(addon.id)
                                    ? 'bg-purple-50 border-purple-200 text-purple-700'
                                    : 'bg-white/50 border-gray-100 text-gray-500'
                                    }`}
                                >
                                  <span className="font-bold">{addon.name}</span>
                                  <span className="font-black">+₹{addon.base_charge}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Side: Details & Summary */}
          <div className="lg:w-96 space-y-8">
            {/* Address Selection */}
            <div className="glass-premium bg-white/70 rounded-3xl p-8 border border-white shadow-xl">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                  <MapPin className="w-5 h-5" />
                </div>
                <h4 className="text-xl font-bold text-gray-900">Service Location</h4>
              </div>

              <div className="space-y-3 mb-6">
                {addresses.map(addr => (
                  <button
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all ${selectedAddressId === addr.id
                      ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-100'
                      : 'bg-white border-gray-100 hover:border-indigo-100'
                      }`}
                  >
                    <p className="font-bold text-gray-900">{addr.address_type}</p>
                    <p className="text-xs text-gray-500 truncate">{addr.address_line1}, {addr.city}</p>
                  </button>
                ))}
              </div>
              <Link href="/addresses" className="flex items-center gap-2 text-indigo-600 font-bold text-sm hover:underline">
                <Plus className="w-4 h-4" /> Add New Address
              </Link>
            </div>

            {/* Scheduling */}
            <div className="glass-premium bg-white/70 rounded-3xl p-8 border border-white shadow-xl">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </div>
                <h4 className="text-xl font-bold text-gray-900">Schedule</h4>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Preferred Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-white border border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-orange-100 outline-none font-bold text-gray-700"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Preferred Time</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full bg-white border border-gray-100 p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-orange-100 outline-none font-bold text-gray-700"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Final Summary & CTA */}
            <div className="bg-gray-900 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mt-16 -mr-16"></div>

              <h4 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-6 text-center">Checkout Summary</h4>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60 font-medium">Subtotal</span>
                  <span className="font-bold">₹{totalPrice}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60 font-medium">Platform Fee</span>
                  <span className="font-bold text-green-400">FREE</span>
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                  <span className="text-xl font-black">Total</span>
                  <span className="text-3xl font-black text-purple-400">₹{totalPrice}</span>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleCreateBookings}
                  disabled={submitting || quoteLoading}
                  className="w-full py-5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-xl shadow-xl hover:shadow-purple-500/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {submitting ? 'Confirming...' : 'Place Booking'}
                </button>
                <button
                  onClick={handleRateQuote}
                  disabled={submitting || quoteLoading}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 text-white border border-white/20 rounded-2xl font-black text-lg transition-all active:scale-95 disabled:opacity-50"
                >
                  {quoteLoading ? 'Requesting...' : 'Get Quote'}
                </button>
              </div>
              <p className="text-[10px] text-white/30 text-center mt-4 font-bold uppercase tracking-tighter">Secure 256-bit SSL encrypted payment</p>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  )
}

