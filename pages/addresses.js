import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { MapPin as MapPinIcon } from 'lucide-react'
import LocationPicker from '../components/ui/LocationPicker'

export default function Addresses({ user }) {
  const router = useRouter()
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [formData, setFormData] = useState({
    address_type: 'home',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    latitude: '',
    longitude: '',
    is_default: false
  })
  const [locating, setLocating] = useState(false)
  const [saving, setSaving] = useState(false)

  // Map Modal State
  const [showMapModal, setShowMapModal] = useState(false)
  const [mapCoordinates, setMapCoordinates] = useState({ lat: 20.5937, lng: 78.9629 }) // Default: India Center

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    loadAddresses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadAddresses = async () => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const { data } = await axios.get(`/api/users/${user.id}/address`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAddresses(data.addresses || [])
    } catch (error) {
      console.error('Error loading addresses:', error)
      toast.error('Failed to load addresses')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const payload = {
        ...formData,
        latitude: formData.latitude !== '' ? Number(formData.latitude) : null,
        longitude: formData.longitude !== '' ? Number(formData.longitude) : null
      }

      if (editingAddress) {
        await axios.put(`/api/users/${user.id}/address`, {
          address_id: editingAddress.id,
          ...payload
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })
        toast.success('Address updated successfully')
      } else {
        await axios.post(`/api/users/${user.id}/address`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        })
        toast.success('Address added successfully')
      }

      setShowModal(false)
      setEditingAddress(null)
      setFormData({
        address_type: 'home',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        pincode: '',
        latitude: '',
        longitude: '',
        is_default: false
      })
      loadAddresses()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save address')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (address) => {
    setEditingAddress(address)
    setFormData({
      address_type: address.address_type,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || '',
      city: address.city,
      state: address.state || '',
      pincode: address.pincode || '',
      latitude: address.latitude || '',
      longitude: address.longitude || '',
      is_default: address.is_default
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this address?')) return

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      await axios.delete(`/api/users/${user.id}/address`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { address_id: id }
      })

      toast.success('Address deleted successfully')
      loadAddresses()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error(error.response?.data?.error || 'Failed to delete address')
    }
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords

        // Update map coordinates if map is open
        setMapCoordinates({ lat: latitude, lng: longitude })

        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
        const data = await response.json()
        const address = data.address || {}

        setFormData(prev => ({
          ...prev,
          address_line1: address.road || data.display_name?.split(',')[0] || '',
          address_line2: address.suburb || '',
          city: address.city || address.town || address.village || '',
          state: address.state || '',
          pincode: address.postcode || '',
          latitude,
          longitude
        }))

        toast.success('Location detected and filled in the form')
      } catch (error) {
        console.error('Location fetch error:', error)
        toast.error('Failed to fetch address from location')
      } finally {
        setLocating(false)
      }
    }, () => {
      toast.error('Unable to fetch your location')
      setLocating(false)
    }, { enableHighAccuracy: true })
  }

  const openMapPicker = () => {
    // If we already have lat/long, use it
    if (formData.latitude && formData.longitude) {
      setMapCoordinates({
        lat: Number(formData.latitude),
        lng: Number(formData.longitude)
      })
    } else {
      // Try to geocode current address fields if available, otherwise default
      // For now just defaulting or keeping previous
    }
    setShowMapModal(true)
  }

  const handleMapConfirm = () => {
    setFormData(prev => ({
      ...prev,
      latitude: mapCoordinates.lat,
      longitude: mapCoordinates.lng
    }))
    setShowMapModal(false)
    toast.success('Location coordinates updated!')
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
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-blue-600">My Addresses</h1>
            <button
              onClick={() => {
                setEditingAddress(null)
                setFormData({
                  address_type: 'home',
                  address_line1: '',
                  address_line2: '',
                  city: '',
                  state: '',
                  pincode: '',
                  latitude: '',
                  longitude: '',
                  is_default: false
                })
                setShowModal(true)
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Address
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {addresses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 mb-4">No addresses saved yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Your First Address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map(address => (
              <div key={address.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="font-semibold text-lg capitalize">{address.address_type}</div>
                    {address.is_default && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Default</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(address)}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="text-gray-600 space-y-1">
                  <div>{address.address_line1}</div>
                  {address.address_line2 && <div>{address.address_line2}</div>}
                  <div>{address.city}, {address.state} {address.pincode}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">{editingAddress ? 'Edit Address' : 'Add Address'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
                <select
                  value={formData.address_type}
                  onChange={(e) => setFormData({ ...formData, address_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="home">Home</option>
                  <option value="office">Office</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={useCurrentLocation}
                  disabled={locating}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
                >
                  {locating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      Detecting...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      Use Current Location
                    </>
                  )}
                </button>

              </div>

              {/* Map Preview / Button */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-blue-900">Pin Location on Map</label>
                  {formData.latitude && formData.longitude && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      Location Set ✓
                    </span>
                  )}
                </div>
                <p className="text-xs text-blue-700 mb-3">
                  Set the exact location for better service delivery.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={openMapPicker}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <MapPinIcon className="w-4 h-4" />
                    {formData.latitude && formData.longitude ? 'Adjust Location on Map' : 'Set Location on Map'}
                  </button>
                </div>
                {formData.latitude && formData.longitude && (
                  <div className="mt-2 text-xs text-gray-500">
                    Lat: {Number(formData.latitude).toFixed(4)}, Lng: {Number(formData.longitude).toFixed(4)}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1 *</label>
                <input
                  type="text"
                  required
                  value={formData.address_line1}
                  onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
                <input
                  type="text"
                  value={formData.address_line2}
                  onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700">Set as default address</label>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingAddress ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingAddress(null)
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div >
      )
      }

      {/* Map Picker Modal */}
      {
        showMapModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-lg p-0 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col relative">
              <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Set Precise Location</h3>
                  <p className="text-sm text-gray-500">Drag the map to position the pin exactly at your location</p>
                </div>
                <button
                  onClick={() => setShowMapModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-0 flex-1 relative bg-gray-100 min-h-[400px]">
                <LocationPicker
                  value={mapCoordinates}
                  onChange={setMapCoordinates}
                  center={[mapCoordinates.lat, mapCoordinates.lng]}
                  zoom={15}
                />

                {/* Floating Confirm Button */}
                <div className="absolute bottom-6 left-0 right-0 px-6 flex justify-center z-[500]">
                  <button
                    type="button"
                    onClick={handleMapConfirm}
                    className="bg-black text-white px-8 py-3 rounded-full font-medium shadow-xl hover:bg-gray-800 transform hover:scale-105 transition-all flex items-center gap-2"
                  >
                    <MapPinIcon className="w-5 h-5 text-red-500" />
                    Confirm Location
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  )
}

