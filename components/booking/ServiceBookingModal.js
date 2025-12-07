import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import axios from 'axios'
import toast from 'react-hot-toast'
import { MapPin as MapPinIcon, X } from 'lucide-react'
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex justify-center items-start pt-10 pb-10">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl relative flex flex-col max-h-[90vh]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
                >
                    <X size={24} />
                </button>

                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900">Book a Service</h2>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* City Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Select City *</label>
                                <select
                                    required
                                    value={selectedCity || ''}
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select City</option>
                                    {cities.map(city => (
                                        <option key={city.id} value={city.id}>{city.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Category Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Service Selection */}
                            {selectedCategory && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Service *</label>
                                    {servicesLoading ? (
                                        <div className="text-center py-4 text-gray-500">Loading services...</div>
                                    ) : services.length === 0 ? (
                                        <div className="text-center py-4 text-gray-500">No services available</div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {services.map(service => (
                                                <button
                                                    key={service.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedServiceId(service.id)
                                                        setSelectedSubServiceIds([])
                                                        setSelectedSubSubServiceIds([])
                                                    }}
                                                    className={`p-3 border rounded-lg text-left transition-all ${selectedServiceId === service.id
                                                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <div className="font-medium text-gray-900">{service.name}</div>
                                                    <div className="text-sm text-blue-600 mt-1">₹{service.base_price}</div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Sub Services */}
                            {selectedServiceId && activeService?.sub_services?.length > 0 && (
                                <div className="border-t pt-4">
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">Options for {activeService.name}</label>
                                    <div className="space-y-3">
                                        {activeService.sub_services.map(subService => (
                                            <div key={subService.id} className="border rounded-lg p-3">
                                                <label className="flex items-start cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedSubServiceIds.includes(subService.id)}
                                                        onChange={() => handleSubServiceToggle(subService.id)}
                                                        className="mt-1 mr-3 h-4 w-4 text-blue-600"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex justify-between">
                                                            <span className="font-medium">{subService.name}</span>
                                                            <span className="text-blue-600">₹{subService.base_charge}</span>
                                                        </div>
                                                        {selectedSubServiceIds.includes(subService.id) && subService.sub_subservices?.length > 0 && (
                                                            <div className="mt-2 ml-2 pl-3 border-l-2 border-gray-100 space-y-2">
                                                                {subService.sub_subservices.map(addon => (
                                                                    <label key={addon.id} className="flex items-center justify-between cursor-pointer">
                                                                        <div className="flex items-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={selectedSubSubServiceIds.includes(addon.id)}
                                                                                onChange={() => handleSubSubServiceToggle(addon.id)}
                                                                                className="mr-2 h-4 w-4 text-blue-600"
                                                                            />
                                                                            <span className="text-sm text-gray-600">{addon.name}</span>
                                                                        </div>
                                                                        <span className="text-sm text-blue-600">+₹{addon.base_charge}</span>
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

                            {/* Address */}
                            <div className="border-t pt-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Service Address *</label>
                                {addresses.length > 0 && (
                                    <div className="mb-3 space-y-2">
                                        {addresses.map(address => (
                                            <button
                                                key={address.id}
                                                type="button"
                                                onClick={() => handleAddressSelect(address)}
                                                className={`w-full text-left p-3 border rounded-lg text-sm ${selectedAddress === address.id
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="font-medium">{address.address_type}</div>
                                                <div className="text-gray-500 truncate">{address.address_line1}, {address.city}</div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className="flex gap-2 mb-3">
                                    <button
                                        type="button"
                                        onClick={autoDetectCityFromLocation}
                                        disabled={cityAutoDetecting}
                                        className="flex-1 py-2 px-3 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
                                    >
                                        {cityAutoDetecting ? 'Detecting...' : '📍 Use Current Location'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={openMapPicker}
                                        className="flex-1 py-2 px-3 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
                                    >
                                        <MapPinIcon size={16} />
                                        {formData.service_lat ? 'Adjust Pin' : 'Set on Map'}
                                    </button>
                                </div>

                                <textarea
                                    required
                                    value={formData.service_address}
                                    onChange={(e) => setFormData({ ...formData, service_address: e.target.value })}
                                    placeholder="Complete Address"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    rows={2}
                                />
                            </div>

                            {/* Schedule */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                                    <input
                                        type="date"
                                        value={formData.scheduled_date}
                                        onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Time</label>
                                    <input
                                        type="time"
                                        value={formData.scheduled_time}
                                        onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Quote Price */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Your Offer Price (Optional)</label>
                                <input
                                    type="number"
                                    value={formData.user_quoted_price}
                                    onChange={(e) => setFormData({ ...formData, user_quoted_price: e.target.value })}
                                    placeholder="Enter amount if you want to negotiate"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Price Summary */}
                            <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                                <span className="font-medium text-gray-700">Estimated Total</span>
                                <span className="text-xl font-bold text-blue-600">₹{chargeSummary.base}</span>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={submitting || quoteLoading}
                                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {submitting ? 'Booking...' : 'Book Now'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRateQuote}
                                    disabled={submitting || quoteLoading}
                                    className="flex-1 bg-white text-blue-600 border-2 border-blue-600 py-3 rounded-lg font-bold hover:bg-blue-50 disabled:opacity-50"
                                >
                                    {quoteLoading ? 'Requesting...' : 'Request Quote'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Map Modal */}
            {showMapModal && (
                <div className="fixed inset-0 z-[60] bg-black bg-opacity-75 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg w-full max-w-2xl h-[500px] flex flex-col relative">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="font-bold">Set Location</h3>
                            <button onClick={() => setShowMapModal(false)}><X size={20} /></button>
                        </div>
                        <div className="flex-1 relative bg-gray-100">
                            <LocationPicker
                                value={mapCoordinates}
                                onChange={setMapCoordinates}
                                center={[mapCoordinates.lat, mapCoordinates.lng]}
                                zoom={15}
                            />
                        </div>
                        <div className="p-4 border-t">
                            <button
                                onClick={handleMapConfirm}
                                className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold"
                            >
                                Confirm Location
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
