import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { MapPin, Calendar, Clock, X, Plus, ChevronRight } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function BookService({ user }) {
  const router = useRouter()
  const { services: servicesQuery } = router.query

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [quoteLoading, setQuoteLoading] = useState(false)

  const [selectedServices, setSelectedServices] = useState([])
  const [addresses, setAddresses] = useState([])
  const [cities, setCities] = useState([])
  const [serviceConfigs, setServiceConfigs] = useState({})
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [waitingTimeFlexibility, setWaitingTimeFlexibility] = useState('Exact Time')
  const [bookingMode, setBookingMode] = useState('standard')
  const [offerPrice, setOfferPrice] = useState('')

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
      if (servicesQuery) {
        const { data } = await axios.get(`/api/services/bulk?ids=${servicesQuery}`)
        setSelectedServices(data.services || [])
        const initialConfigs = {}
        data.services.forEach(s => {
          initialConfigs[s.id] = { subServiceIds: [], subSubServiceIds: [] }
        })
        setServiceConfigs(initialConfigs)
      }

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
      if (updated.length === 0) router.push('/')
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

    const isOfferMode = bookingMode === 'offer'
    if (isOfferMode && (!offerPrice || Number(offerPrice) <= 0)) {
      return toast.error('Please enter your offer price')
    }

    setQuoteLoading(true)
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const address = addresses.find(a => a.id === selectedAddressId)
      const city = cities.find(c => c.name.toLowerCase() === address.city.toLowerCase())

      const service = selectedServices[0]
      const config = serviceConfigs[service.id] || { subServiceIds: [], subSubServiceIds: [] }

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
        requested_price: bookingMode === 'offer' ? Number(offerPrice) : null,
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
          hourly_charge: null,
          waiting_time_flexibility: waitingTimeFlexibility
        }
      }

      const { data } = await axios.post('/api/rate-quotes', payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      toast.success(bookingMode === 'offer' ? 'Offer broadcasted to providers!' : 'Rate quote requested!')
      router.push(`/rate-quote/${data.rate_quote.id}`)
    } catch (error) {
      console.error('Rate quote error:', error)
      toast.error(error.response?.data?.error || 'Failed to request rate quote')
    } finally {
      setQuoteLoading(false)
    }
  }

  const handleModeAction = () => {
    if (bookingMode === 'standard') {
      handleCreateBookings()
    } else {
      handleRateQuote()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Preparing your checkout...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/20">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.8);
        }
        .gradient-border {
          background: linear-gradient(white, white) padding-box,
                      linear-gradient(135deg, #a855f7, #ec4899) border-box;
          border: 2px solid transparent;
        }
        .glow-button:hover {
          box-shadow: 0 0 30px rgba(168, 85, 247, 0.4);
        }
      `}</style>

      <Header user={user} />

      {/* Progress Indicator */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <div className="flex items-center justify-center gap-3 text-sm font-semibold">
          <span className="text-purple-600">Cart</span>
          <ChevronRight className="w-4 h-4 text-gray-300" />
          <span className="text-purple-600">Address</span>
          <ChevronRight className="w-4 h-4 text-gray-300" />
          <span className="text-purple-600">Schedule</span>
          <ChevronRight className="w-4 h-4 text-gray-300" />
          <span className="text-gray-400">Confirm</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-[1fr_400px_380px] gap-8">

          {/* LEFT: Review Basket */}
          <div className="space-y-6">
            <div className="flex items-baseline gap-3">
              <h1 className="text-4xl font-bold text-gray-900">Review <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Basket</span></h1>
              <span className="text-sm text-gray-500 font-medium">{selectedServices.length} {selectedServices.length === 1 ? 'item' : 'items'}</span>
            </div>

            {selectedServices.map(service => (
              <div key={service.id} className="glass-card rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0">
                    {service.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{service.name}</h3>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{service.category?.name}</p>
                    <div className="mt-3 flex items-center gap-3 text-sm">
                      <span className="text-purple-600 font-bold">₹{calculateServicePrice(service)}</span>
                      {service.estimated_duration && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-gray-500">{service.estimated_duration}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeService(service.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {service.sub_services?.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Customize Service</p>
                    <div className="space-y-3">
                      {service.sub_services.map(sub => (
                        <div key={sub.id}>
                          <button
                            onClick={() => toggleSubService(service.id, sub.id)}
                            className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between ${
                              serviceConfigs[service.id]?.subServiceIds.includes(sub.id)
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-100 bg-white hover:border-purple-200'
                            }`}
                          >
                            <span className="font-semibold text-gray-900">{sub.name}</span>
                            <span className="font-bold text-purple-600">₹{sub.base_charge}</span>
                          </button>

                          {serviceConfigs[service.id]?.subServiceIds.includes(sub.id) && sub.sub_subservices?.length > 0 && (
                            <div className="ml-6 mt-2 space-y-2">
                              {sub.sub_subservices.map(addon => (
                                <button
                                  key={addon.id}
                                  onClick={() => toggleSubSubService(service.id, addon.id)}
                                  className={`w-full p-3 rounded-lg border transition-all text-sm flex items-center justify-between ${
                                    serviceConfigs[service.id]?.subSubServiceIds.includes(addon.id)
                                      ? 'border-purple-300 bg-purple-50 text-purple-700'
                                      : 'border-gray-100 bg-white text-gray-600 hover:border-purple-100'
                                  }`}
                                >
                                  <span className="font-medium">{addon.name}</span>
                                  <span className="font-bold">+₹{addon.base_charge}</span>
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

          {/* MIDDLE: Location & Schedule */}
          <div className="space-y-6">
            {/* Step 1: Location */}
            <div className="glass-card rounded-3xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Step 1</p>
                  <h3 className="text-lg font-bold text-gray-900">Service Location</h3>
                </div>
              </div>

              <div className="space-y-4">
                <select
                  value={selectedAddressId || ''}
                  onChange={(e) => setSelectedAddressId(e.target.value)}
                  className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none font-semibold text-gray-700 transition-all bg-white"
                >
                  <option value="" disabled>Select an address</option>
                  {addresses.map(addr => (
                    <option key={addr.id} value={addr.id}>
                      {addr.address_type} - {addr.address_line1}, {addr.city}
                      {addr.is_default ? ' (Default)' : ''}
                    </option>
                  ))}
                </select>

                {selectedAddressId && (
                  <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    {(() => {
                      const addr = addresses.find(a => a.id === selectedAddressId)
                      return addr ? (
                        <>
                          <p className="font-bold text-gray-900 mb-1 capitalize">{addr.address_type}</p>
                          <p className="text-sm text-gray-600">{addr.address_line1}</p>
                          {addr.address_line2 && <p className="text-sm text-gray-600">{addr.address_line2}</p>}
                          <p className="text-sm text-gray-600">{addr.city}, {addr.state} {addr.pincode}</p>
                        </>
                      ) : null
                    })()}
                  </div>
                )}
              </div>

              <Link href="/addresses" className="mt-4 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-200 rounded-2xl text-indigo-600 font-semibold text-sm hover:border-indigo-300 hover:bg-indigo-50/50 transition-all">
                <Plus className="w-4 h-4" />
                Add New Address
              </Link>
            </div>

            {/* Step 2: Schedule */}
            <div className="glass-card rounded-3xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Step 2</p>
                  <h3 className="text-lg font-bold text-gray-900">Schedule</h3>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Preferred Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none font-semibold text-gray-700 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Preferred Time</label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none font-semibold text-gray-700 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Booking Mode Panel */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-600/20 rounded-full blur-3xl"></div>

              <div className="relative z-10">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest text-center mb-6">Booking Mode</h4>

                {/* Mode Toggle */}
                <div className="flex gap-2 p-1.5 bg-black/30 rounded-2xl mb-8 backdrop-blur-sm">
                  {['standard', 'offer', 'bid'].map(mode => (
                    <button
                      key={mode}
                      onClick={() => setBookingMode(mode)}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                        bookingMode === mode
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg glow-button'
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {mode === 'standard' ? 'Standard' : mode === 'offer' ? 'Your Offer' : 'Get Bids'}
                    </button>
                  ))}
                </div>

                {/* Mode Content */}
                <div className="space-y-6 mb-8">
                  {bookingMode === 'standard' && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Subtotal</span>
                        <span className="font-bold text-white">₹{totalPrice}</span>
                      </div>
                      <div className="pt-4 border-t border-white/20">
                        <p className="text-xs text-gray-300 mb-3">Instant confirmation at provider's rate</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold text-white">Total</span>
                          <span className="text-4xl font-black text-purple-400">₹{totalPrice}</span>
                        </div>
                      </div>
                    </>
                  )}

                  {bookingMode === 'offer' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-2">Your Offer Price</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-bold">₹</span>
                          <input
                            type="number"
                            value={offerPrice}
                            onChange={(e) => setOfferPrice(e.target.value)}
                            placeholder={`${Math.round(totalPrice * 0.85)}`}
                            className="w-full pl-10 pr-4 py-4 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 outline-none font-bold transition-all"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-orange-300 font-semibold">Providers will be notified. First to accept wins.</p>
                    </div>
                  )}

                  {bookingMode === 'bid' && (
                    <div className="text-center py-4">
                      <p className="font-bold text-white mb-2">Request Competitive Bids</p>
                      <p className="text-sm text-gray-300">Providers send their best quotes. You choose the winner.</p>
                    </div>
                  )}

                  {bookingMode !== 'standard' && (
                    <div className="pt-4 border-t border-white/20">
                      <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-2">Waiting Flexibility</label>
                      <select
                        value={waitingTimeFlexibility}
                        onChange={(e) => setWaitingTimeFlexibility(e.target.value)}
                        className="w-full p-3 bg-white/10 border-2 border-white/30 rounded-xl text-white font-semibold focus:border-purple-400 outline-none cursor-pointer transition-all"
                      >
                        <option value="Exact Time" className="text-gray-900">Exact Time</option>
                        <option value="+/- 30 Minutes" className="text-gray-900">+/- 30 Minutes</option>
                        <option value="+/- 1 Hour" className="text-gray-900">+/- 1 Hour</option>
                        <option value="+/- 2 Hours" className="text-gray-900">+/- 2 Hours</option>
                        <option value="Same Day (Anytime)" className="text-gray-900">Same Day</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  onClick={handleModeAction}
                  disabled={submitting || quoteLoading}
                  className="w-full py-5 bg-white text-gray-900 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed glow-button"
                >
                  {submitting || quoteLoading ? 'Processing...' :
                    bookingMode === 'standard' ? 'Book Now' :
                      bookingMode === 'offer' ? 'Broadcast Offer' : 'Request Quotes'}
                </button>

                <p className="text-xs text-gray-400 text-center mt-4 font-medium">🔒 Secure 256-bit SSL encrypted</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
