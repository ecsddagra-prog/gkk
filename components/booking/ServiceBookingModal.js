import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import axios from 'axios'
import toast from 'react-hot-toast'
import { MapPin as MapPinIcon, X, Layout } from 'lucide-react'
import LocationPicker from '../ui/LocationPicker'

export default function ServiceBookingModal({ isOpen, onClose, user, initialServiceId, initialCityId }) {
    const router = useRouter()
    const [services, setServices] = useState([])
    const [categories, setCategories] = useState([])
    const [cities, setCities] = useState([])
    const [addresses, setAddresses] = useState([])
    const [profile, setProfile] = useState(null)
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [selectedServiceId, setSelectedServiceId] = useState(initialServiceId || null)
    const [selectedSubServiceIds, setSelectedSubServiceIds] = useState([])
    const [selectedSubSubServiceIds, setSelectedSubSubServiceIds] = useState([])
    const [selectedCity, setSelectedCity] = useState(initialCityId || null)
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
    const [showMapModal, setShowMapModal] = useState(false)
    const [mapCoordinates, setMapCoordinates] = useState({ lat: 20.5937, lng: 78.9629 })

    useEffect(() => {
        if (isOpen) {
            loadData()
        }
    }, [isOpen])

    useEffect(() => {
        if (initialServiceId) setSelectedServiceId(initialServiceId)
        if (initialCityId) setSelectedCity(initialCityId)
    }, [initialServiceId, initialCityId])

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

            if (!selectedCity) {
                const defaultCityId = determineDefaultCity(data.cities || [], data.profile, data.addresses)
                setSelectedCity(defaultCityId)
            }

            if (data.addresses && data.addresses.length > 0) {
                const defaultAddress = data.addresses.find(addr => addr.is_default) || data.addresses[0]
                handleAddressSelect(defaultAddress)
            }
        } catch (error) {
            console.error('Error loading data:', error)
            toast.error('Failed to load booking data')
        } finally {
            setLoading(false)
        }
    }

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

    useEffect(() => {
        if (selectedCity && selectedCategory) {
            loadServices()
        } else if (selectedCity && selectedServiceId) {
            // If we have a service ID but no category (e.g. from direct click), we need to find the category
            // But we can also just load the service details directly if needed, or infer category
            // For now, let's assume if we have serviceId, we might need to fetch its category or just load it
            // Actually, if we have serviceId, we should probably just fetch that specific service or all services for the city
            // Let's just load services for the city if we don't have a category but have a service
            // Or better, find the category of the selected service from the bootstrap data if possible, but we don't have services in bootstrap
            // Let's just rely on user selecting category if not provided, or if we passed serviceId, we should probably pass categoryId too
        }
    }, [selectedCity, selectedCategory])

    // If initialServiceId is provided, we need to ensure we have its category to load the list
    // Or we can fetch the service details separately.
    // For simplicity, let's assume the parent passes the category too if it passes serviceId, or we fetch it.
    // Let's add a check: if we have serviceId but no category, try to fetch service details to get category
    useEffect(() => {
        const fetchServiceDetails = async () => {
            if (selectedServiceId && !selectedCategory) {
                try {
                    const { data } = await axios.get(`/api/services/${selectedServiceId}`)
                    if (data.service) {
                        setSelectedCategory(data.service.category_id)
                    }
                } catch (e) {
                    console.error("Error fetching service details", e)
                }
            }
        }
        if (selectedServiceId && !selectedCategory && isOpen) {
            fetchServiceDetails()
        }
    }, [selectedServiceId, selectedCategory, isOpen])


    const loadServices = async () => {
        if (!selectedCity || !selectedCategory) return
        setServicesLoading(true)
        try {
            const { data } = await axios.get('/api/services', {
                params: {
                    city_id: selectedCity,
                    category_id: selectedCategory
                }
            })
            setServices(data.services || [])
        } catch (error) {
            console.error('Error loading services:', error)
            toast.error('Failed to load services')
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

    const openMapPicker = () => {
        if (formData.service_lat && formData.service_lng) {
            setMapCoordinates({
                lat: Number(formData.service_lat),
                lng: Number(formData.service_lng)
            })
        }
        setShowMapModal(true)
    }

    const handleMapConfirm = () => {
        setFormData(prev => ({
            ...prev,
            service_lat: mapCoordinates.lat,
            service_lng: mapCoordinates.lng
        }))
        setShowMapModal(false)
        toast.success('Location coordinates updated!')
    }

    const autoDetectCityFromLocation = useCallback(() => {
        if (cityAutoDetecting || typeof window === 'undefined') return
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported')
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
                    toast.error('Unable to detect city')
                    return
                }

                const matchedCity = cities.find(city => city.name?.toLowerCase() === detectedCityName.toLowerCase())

                setFormData(prev => ({
                    ...prev,
                    service_address: data.display_name || '',
                    city: detectedCityName,
                    state: address.state || '',
                    pincode: address.postcode || '',
                    service_lat: latitude,
                    service_lng: longitude
                }))

                if (matchedCity) {
                    setSelectedCity(matchedCity.id)
                } else {
                    toast.error(`Services not available in ${detectedCityName} yet`)
                }
                toast.success('Location detected')
            } catch (error) {
                console.error('Auto detect error:', error)
                toast.error('Failed to auto-detect location')
            } finally {
                setCityAutoDetecting(false)
            }
        }, (error) => {
            console.error('Geolocation error:', error)
            toast.error('Unable to fetch location')
            setCityAutoDetecting(false)
        }, { enableHighAccuracy: true })
    }, [cityAutoDetecting, cities])

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
            totalBase = activeSubServices.reduce((sum, sub) => sum + (parseFloat(sub.base_charge) || 0), 0)
            totalBase += activeSubSubServices.reduce((sum, subSub) => sum + (parseFloat(subSub.base_charge) || 0), 0)
            return { base: totalBase, hourly: null }
        }
        return {
            base: activeService?.base_price ?? 0,
            hourly: null
        }
    }, [activeService, activeSubServices, activeSubSubServices])

    const handleSubServiceToggle = (subServiceId) => {
        setSelectedSubServiceIds(prev => {
            if (prev.includes(subServiceId)) {
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
            onClose()
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

            toast.success('Rate quote requested!')
            onClose()
            router.push(`/rate-quote/${data.rate_quote.id}`)
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to request rate quote')
        } finally {
            setQuoteLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/40 backdrop-blur-md flex justify-center items-start pt-10 pb-10 px-4">
            <div className="glass-premium bg-white/80 rounded-[48px] shadow-2xl w-full max-w-2xl relative flex flex-col max-h-[90vh] border border-white">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 bg-gray-100/50 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-2xl transition-all z-20"
                >
                    <X size={24} />
                </button>

                <div className="p-10 border-b border-gray-100 shrink-0">
                    <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1">Reservation Center</p>
                    <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Book your <span className="text-purple-600">Experience</span></h2>
                </div>

                <div className="p-10 overflow-y-auto flex-1 scrollbar-hide">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Assembling components...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-10">
                            {/* Location & City */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Service City</label>
                                    <select
                                        required
                                        value={selectedCity || ''}
                                        onChange={(e) => setSelectedCity(e.target.value)}
                                        className="w-full bg-gray-50/50 border border-gray-100 p-4 rounded-2xl focus:ring-4 focus:ring-purple-100 outline-none font-bold text-gray-700 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">Choose City</option>
                                        {cities.map(city => (
                                            <option key={city.id} value={city.id}>{city.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Service Category</label>
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
                                        className="w-full bg-gray-50/50 border border-gray-100 p-4 rounded-2xl focus:ring-4 focus:ring-purple-100 outline-none font-bold text-gray-700 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Service Selection */}
                            {selectedCategory && (
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Available Treatments</label>
                                    {servicesLoading ? (
                                        <div className="text-center py-10 opacity-20">
                                            <div className="animate-spin w-8 h-8 border-2 border-purple-600 rounded-full border-t-transparent mx-auto"></div>
                                        </div>
                                    ) : services.length === 0 ? (
                                        <div className="text-center py-10 glass-premium rounded-3xl border border-dashed border-gray-200">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No specialties found here</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {services.map(service => (
                                                <button
                                                    key={service.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedServiceId(service.id)
                                                        setSelectedSubServiceIds([])
                                                        setSelectedSubSubServiceIds([])
                                                    }}
                                                    className={`p-6 rounded-[24px] border transition-all text-left relative overflow-hidden group ${selectedServiceId === service.id
                                                        ? 'bg-purple-600 border-purple-600 text-white shadow-xl shadow-purple-200'
                                                        : 'bg-white border-gray-100 text-gray-800 hover:border-purple-200'
                                                        }`}
                                                >
                                                    <div className="relative z-10">
                                                        <div className={`text-xs font-black uppercase tracking-widest mb-1 ${selectedServiceId === service.id ? 'text-white/60' : 'text-purple-600'}`}>Professional</div>
                                                        <div className="font-black text-lg uppercase tracking-tighter truncate">{service.name}</div>
                                                        <div className={`text-sm font-black mt-2 ${selectedServiceId === service.id ? 'text-white' : 'text-gray-900'}`}>₹{service.base_price}</div>
                                                    </div>
                                                    {selectedServiceId === service.id && (
                                                        <div className="absolute -right-4 -bottom-4 text-white/10 text-6xl font-black rotate-12">✓</div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Sub Services */}
                            {selectedServiceId && activeService?.sub_services?.length > 0 && (
                                <div className="space-y-6 pt-6 border-t border-gray-100">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Customize your {activeService.name}</label>
                                    <div className="grid grid-cols-1 gap-4">
                                        {activeService.sub_services.map(subService => (
                                            <div key={subService.id} className={`rounded-[32px] border transition-all p-6 ${selectedSubServiceIds.includes(subService.id) ? 'bg-purple-50/50 border-purple-100' : 'bg-gray-50/30 border-gray-100'}`}>
                                                <label className="flex items-start cursor-pointer group">
                                                    <div className="relative mt-1 mr-4">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedSubServiceIds.includes(subService.id)}
                                                            onChange={() => handleSubServiceToggle(subService.id)}
                                                            className="hidden"
                                                        />
                                                        <div className={`w-6 h-6 rounded-xl border-2 transition-all flex items-center justify-center ${selectedSubServiceIds.includes(subService.id) ? 'bg-purple-600 border-purple-600' : 'bg-white border-gray-200 group-hover:border-purple-300'}`}>
                                                            {selectedSubServiceIds.includes(subService.id) && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-black text-gray-900 uppercase tracking-tight">{subService.name}</span>
                                                            <span className="font-black text-purple-600">₹{subService.base_charge}</span>
                                                        </div>
                                                        {selectedSubServiceIds.includes(subService.id) && subService.sub_subservices?.length > 0 && (
                                                            <div className="mt-6 space-y-3">
                                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest pl-2 mb-2">Extended Options</p>
                                                                {subService.sub_subservices.map(addon => (
                                                                    <div
                                                                        key={addon.id}
                                                                        onClick={() => handleSubSubServiceToggle(addon.id)}
                                                                        className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${selectedSubSubServiceIds.includes(addon.id) ? 'bg-white border border-purple-100 shadow-sm' : 'bg-white/40 border border-transparent hover:border-gray-100'}`}
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <div className={`w-4 h-4 rounded-md border transition-all ${selectedSubSubServiceIds.includes(addon.id) ? 'bg-purple-600 border-purple-600' : 'bg-white border-gray-200'}`}></div>
                                                                            <span className="text-xs font-bold text-gray-600">{addon.name}</span>
                                                                        </div>
                                                                        <span className="text-xs font-black text-gray-900">+₹{addon.base_charge}</span>
                                                                    </div>
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

                            {/* Address & Scheduling */}
                            <div className="space-y-10 pt-6 border-t border-gray-100">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Location Details</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <button
                                            type="button"
                                            onClick={autoDetectCityFromLocation}
                                            disabled={cityAutoDetecting}
                                            className="p-4 rounded-2xl border border-gray-100 text-[10px] font-black uppercase tracking-widest hover:bg-purple-50 hover:border-purple-100 transition-all flex items-center justify-center gap-2 group shadow-sm bg-white"
                                        >
                                            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <MapPinIcon size={16} />
                                            </div>
                                            {cityAutoDetecting ? 'Detecting...' : 'Auto Detect'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={openMapPicker}
                                            className="p-4 rounded-2xl border border-gray-100 text-[10px] font-black uppercase tracking-widest hover:bg-purple-50 hover:border-purple-100 transition-all flex items-center justify-center gap-2 group shadow-sm bg-white"
                                        >
                                            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Layout size={16} />
                                            </div>
                                            Set on Map
                                        </button>
                                    </div>

                                    <textarea
                                        required
                                        value={formData.service_address}
                                        onChange={(e) => setFormData({ ...formData, service_address: e.target.value })}
                                        placeholder="Enter your complete address..."
                                        className="w-full bg-gray-50/50 border border-gray-100 p-6 rounded-[24px] focus:ring-4 focus:ring-purple-100 outline-none font-bold text-gray-700 transition-all placeholder:text-gray-300 min-h-[100px]"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Target Date</label>
                                        <input
                                            type="date"
                                            value={formData.scheduled_date}
                                            onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                                            className="w-full bg-gray-50/50 border border-gray-100 p-4 rounded-2xl focus:ring-4 focus:ring-purple-100 outline-none font-bold text-gray-700 appearance-none"
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Arrival Time</label>
                                        <input
                                            type="time"
                                            value={formData.scheduled_time}
                                            onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                                            className="w-full bg-gray-50/50 border border-gray-100 p-4 rounded-2xl focus:ring-4 focus:ring-purple-100 outline-none font-bold text-gray-700 appearance-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}
                </div>

                {/* Footer Section */}
                {!loading && (
                    <div className="p-10 bg-gray-900 rounded-b-[48px] shrink-0 border-t border-white/10">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                            <div className="text-center md:text-left">
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Total Estimated Investment</p>
                                <p className="text-4xl font-black text-white tracking-tighter">₹{chargeSummary.base}</p>
                            </div>
                            <div className="flex gap-4 w-full md:w-auto">
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting || quoteLoading}
                                    className="flex-1 md:flex-none px-10 py-5 bg-purple-600 hover:bg-purple-700 text-white rounded-[24px] font-black text-lg transition-all active:scale-95 shadow-xl shadow-purple-500/20 disabled:opacity-50"
                                >
                                    {submitting ? 'Processing...' : 'Reserve Now'}
                                </button>
                                <button
                                    onClick={handleRateQuote}
                                    disabled={submitting || quoteLoading}
                                    className="flex-1 md:flex-none px-6 py-5 bg-white/5 hover:bg-white/10 text-white border border-white/20 rounded-[24px] font-black transition-all active:scale-95"
                                >
                                    {quoteLoading ? 'Pending...' : 'Get Quote'}
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-6 text-[8px] font-black text-white/20 uppercase tracking-widest">
                            <span className="flex items-center gap-1">🛡️ Secured</span>
                            <span className="flex items-center gap-1">⚡ Verified</span>
                            <span className="flex items-center gap-1">✨ Best Value</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Map Modal */}
            {showMapModal && (
                <div className="fixed inset-0 z-[60] bg-gray-900/80 backdrop-blur-xl flex items-center justify-center p-6">
                    <div className="glass-premium bg-white/90 rounded-[40px] w-full max-w-2xl h-[600px] flex flex-col relative overflow-hidden border border-white">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white/50">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 tracking-tighter uppercase">Set Precise Location</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Move the pin to your exact door</p>
                            </div>
                            <button onClick={() => setShowMapModal(false)} className="p-3 bg-gray-100 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all"><X size={20} /></button>
                        </div>
                        <div className="flex-1 relative bg-gray-50">
                            <LocationPicker
                                value={mapCoordinates}
                                onChange={setMapCoordinates}
                                center={[mapCoordinates.lat, mapCoordinates.lng]}
                                zoom={15}
                            />
                        </div>
                        <div className="p-8 bg-white border-t border-gray-100">
                            <button
                                onClick={handleMapConfirm}
                                className="w-full bg-gray-900 text-white py-5 rounded-[24px] font-black text-lg hover:bg-black transition-all active:scale-95 shadow-xl"
                            >
                                Confirm Coordinates
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
