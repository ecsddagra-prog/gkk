import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { MapPin, Edit2, Trash2, Plus, ArrowLeft, Home, Briefcase, X } from 'lucide-react'
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
  const [showMapModal, setShowMapModal] = useState(false)
  const [mapCoordinates, setMapCoordinates] = useState({ lat: 20.5937, lng: 78.9629 })
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    loadAddresses()
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
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      await axios.delete(`/api/users/${user.id}/address`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { address_id: id }
      })
      toast.success('Address deleted successfully')
      setDeleteConfirm(null)
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
    if (formData.latitude && formData.longitude) {
      setMapCoordinates({
        lat: Number(formData.latitude),
        lng: Number(formData.longitude)
      })
    }
    setShowMapModal(true)
  }

  const handleMapConfirm = async () => {
    const { lat, lng } = mapCoordinates
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }))
    setShowMapModal(false)

    const toastId = toast.loading('Fetching location details...')
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
      const data = await response.json()
      const address = data.address || {}

      setFormData(prev => ({
        ...prev,
        address_line1: address.road || data.display_name?.split(',')[0] || '',
        address_line2: address.suburb || '',
        city: address.city || address.town || address.village || '',
        state: address.state || '',
        pincode: address.postcode || '',
        latitude: lat,
        longitude: lng
      }))

      toast.success('Location details auto-filled!', { id: toastId })
    } catch (error) {
      console.error('Auto-fill error:', error)
      toast.error('Location saved, but could not fetch address details', { id: toastId })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading addresses...</p>
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
        .address-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .address-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(168, 85, 247, 0.15);
        }
        .address-card:hover .action-buttons {
          opacity: 1;
        }
        .action-buttons {
          opacity: 0;
          transition: opacity 0.2s;
        }
      `}</style>

      {/* Sticky Header */}
      <header className="sticky top-0 z-40 glass-card shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-purple-600 font-semibold transition-colors group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Back</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">My Addresses</h1>
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
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add New
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {addresses.length === 0 ? (
          <div className="glass-card rounded-3xl p-16 text-center shadow-lg">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
              <MapPin className="w-12 h-12 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No saved addresses yet</h3>
            <p className="text-gray-500 mb-8">Add your first address to get started with bookings</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              Add Address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map(address => (
              <div key={address.id} className="glass-card rounded-2xl p-6 shadow-lg address-card group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      address.address_type === 'home' ? 'bg-gradient-to-br from-blue-500 to-indigo-500' :
                      address.address_type === 'office' ? 'bg-gradient-to-br from-orange-500 to-red-500' :
                      'bg-gradient-to-br from-purple-500 to-pink-500'
                    } shadow-md`}>
                      {address.address_type === 'home' ? <Home className="w-6 h-6 text-white" /> :
                       address.address_type === 'office' ? <Briefcase className="w-6 h-6 text-white" /> :
                       <MapPin className="w-6 h-6 text-white" />}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 capitalize">{address.address_type}</h3>
                      {address.is_default && (
                        <span className="inline-block mt-1 text-xs font-semibold px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 action-buttons">
                    <button
                      onClick={() => handleEdit(address)}
                      className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(address.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-4"></div>

                <div className="space-y-2 text-gray-600">
                  <p className="font-semibold text-gray-900">{address.address_line1}</p>
                  {address.address_line2 && <p className="text-sm text-gray-500">{address.address_line2}</p>}
                  <p className="text-sm font-semibold text-gray-700">
                    {address.city}, {address.state} {address.pincode}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{editingAddress ? 'Edit Address' : 'Add New Address'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {['home', 'office', 'other'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, address_type: type })}
                      className={`py-3 rounded-xl font-semibold capitalize transition-all ${
                        formData.address_type === type
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                          : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-purple-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={useCurrentLocation}
                disabled={locating}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-600 rounded-xl font-semibold hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                {locating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    Detecting...
                  </>
                ) : (
                  <>
                    <MapPin className="w-5 h-5" />
                    Use Current Location
                  </>
                )}
              </button>

              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-purple-900">Pin Location on Map</label>
                  {formData.latitude && formData.longitude && (
                    <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full font-semibold">Set ✓</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={openMapPicker}
                  className="w-full mt-2 py-2.5 bg-white border-2 border-purple-200 text-purple-700 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
                >
                  {formData.latitude && formData.longitude ? 'Adjust Location' : 'Set Location'}
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address Line 1 *</label>
                <input
                  type="text"
                  required
                  value={formData.address_line1}
                  onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address Line 2</label>
                <input
                  type="text"
                  value={formData.address_line2}
                  onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pincode</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-sm font-semibold text-gray-700">Set as default address</span>
              </label>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingAddress ? 'Update Address' : 'Add Address'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Set Precise Location</h3>
                  <p className="text-sm text-gray-600 mt-1">Drag the map to position the pin</p>
                </div>
                <button onClick={() => setShowMapModal(false)} className="p-2 hover:bg-white rounded-lg transition-colors">
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="flex-1 relative bg-gray-100 min-h-[400px]">
              <LocationPicker
                value={mapCoordinates}
                onChange={setMapCoordinates}
                center={[mapCoordinates.lat, mapCoordinates.lng]}
                zoom={15}
              />

              <div className="absolute bottom-6 left-0 right-0 px-6 flex justify-center z-[500]">
                <button
                  type="button"
                  onClick={handleMapConfirm}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2"
                >
                  <MapPin className="w-5 h-5" />
                  Confirm Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Address?</h3>
            <p className="text-gray-600 text-center mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
