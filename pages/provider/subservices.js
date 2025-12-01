import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'

const emptyForm = {
  name: '',
  description: '',
  pricing_type: 'fixed',
  base_charge: '',
  per_hour_charge: '',
  is_active: true
}

export default function ProviderSubservices({ user }) {
  const router = useRouter()
  const [provider, setProvider] = useState(null)
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [subservices, setSubservices] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingSubservice, setEditingSubservice] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [rateModal, setRateModal] = useState({ isOpen: false, sub: null, rate: '' })

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    bootstrap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    if (selectedServiceId) {
      loadSubservices(selectedServiceId)
    } else {
      setSubservices([])
    }
  }, [selectedServiceId])

  const bootstrap = async () => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error || !data) {
        router.push('/provider/register')
        return
      }

      setProvider(data)

      const servicesList = []

      if (data.business_subcategory_id) {
        const { data: service } = await supabase
          .from('services')
          .from('services')
          .select('id, name, category:service_categories(id, name)')
          .eq('id', data.business_subcategory_id)
          .single()

        if (service) {
          servicesList.push(service)
        }
      }

      const { data: mapped } = await supabase
        .from('provider_services')
        .from('provider_services')
        .select('service:services(id, name, category:service_categories(id, name))')
        .eq('provider_id', data.id)

      mapped?.forEach(item => {
        if (item.service && !servicesList.some(s => s.id === item.service.id)) {
          servicesList.push(item.service)
        }
      })

      setServices(servicesList)

      // Extract unique categories
      const uniqueCategories = []
      const seenCategoryIds = new Set()

      servicesList.forEach(service => {
        if (service.category && !seenCategoryIds.has(service.category.id)) {
          seenCategoryIds.add(service.category.id)
          uniqueCategories.push(service.category)
        }
      })
      setCategories(uniqueCategories)

    } catch (error) {
      console.error('Provider fetch error:', error)
      toast.error('Failed to load provider info')
    } finally {
      setLoading(false)
    }
  }

  const loadSubservices = async (serviceId) => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const { data } = await axios.get('/api/providers/subservices', {
        params: { service_id: serviceId },
        headers: { Authorization: `Bearer ${token}` }
      })
      setSubservices(data.subservices || [])
    } catch (error) {
      console.error('Subservice load error:', error)
      toast.error(error.response?.data?.error || 'Failed to load sub-services')
    }
  }

  const startCreate = () => {
    setEditingSubservice(null)
    setFormData(emptyForm)
  }

  const startEdit = (sub) => {
    setEditingSubservice(sub)
    setFormData({
      name: sub.name,
      description: sub.description || '',
      pricing_type: sub.pricing_type || 'fixed',
      base_charge: sub.base_charge || '',
      per_hour_charge: sub.per_hour_charge || '',
      is_active: sub.is_active
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedServiceId) {
      toast.error('Select a service first')
      return
    }

    if (!formData.name.trim()) {
      toast.error('Name is required')
      return
    }

    setSaving(true)

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      if (editingSubservice) {
        await axios.put('/api/providers/subservices', {
          id: editingSubservice.id,
          ...formData
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })
        toast.success('Sub-service updated')
      } else {
        await axios.post('/api/providers/subservices', {
          service_id: selectedServiceId,
          ...formData
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })
        toast.success('Sub-service added')
      }

      setFormData(emptyForm)
      setEditingSubservice(null)
      loadSubservices(selectedServiceId)
    } catch (error) {
      console.error('Sub-service save error:', error)
      toast.error(error.response?.data?.error || 'Failed to save sub-service')
    } finally {
      setSaving(false)
    }
  }

  const openRateModal = (sub) => {
    setRateModal({
      isOpen: true,
      sub,
      rate: sub.provider_rate || sub.base_charge || ''
    })
  }

  const saveRate = async (e) => {
    e.preventDefault()
    if (!rateModal.rate) return

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      await axios.post('/api/providers/rates', {
        sub_service_id: rateModal.sub.id,
        rate: rateModal.rate
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      toast.success('Rate updated successfully')
      setRateModal({ isOpen: false, sub: null, rate: '' })
      loadSubservices(selectedServiceId)
    } catch (error) {
      toast.error('Failed to update rate')
    }
  }

  const activeService = useMemo(
    () => services.find(service => service.id === selectedServiceId),
    [services, selectedServiceId]
  )

  const filteredServices = useMemo(() => {
    if (!selectedCategoryId) return []
    return services.filter(s => s.category?.id === selectedCategoryId)
  }, [services, selectedCategoryId])

  const handleCategoryChange = (e) => {
    const catId = e.target.value
    setSelectedCategoryId(catId)
    setSelectedServiceId('') // Reset service when category changes
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!provider) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/provider/dashboard" className="text-blue-600 hover:text-blue-700">
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-blue-600">Manage Sub-Services</h1>
            <div></div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <section className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Category</label>
              <select
                value={selectedCategoryId}
                onChange={handleCategoryChange}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Choose category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Service</label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                disabled={!selectedCategoryId}
              >
                <option value="">Choose service</option>
                {filteredServices.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={startCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={!selectedServiceId}
              >
                Add New Sub-Service
              </button>
            </div>
          </div>
          {activeService && (
            <p className="text-sm text-gray-600">
              Managing variants for: <span className="font-semibold">{activeService.name}</span>
            </p>
          )}
        </section>

        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Existing Sub-Services</h2>
          {subservices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {selectedServiceId ? 'No sub-services yet. Create the first one!' : 'Select a service to view sub-services.'}
            </div>
          ) : (
            <div className="space-y-4">
              {subservices.map(sub => (
                <div key={sub.id} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{sub.name}</h3>
                      {!sub.is_active && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">Inactive</span>
                      )}
                      {sub.created_by_provider_id === provider.id && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">You added</span>
                      )}
                    </div>
                    {sub.description && (
                      <p className="text-sm text-gray-600 mt-1">{sub.description}</p>
                    )}
                    <div className="text-sm text-gray-700 mt-2">
                      Base: ₹{sub.base_charge || 0}
                      {sub.per_hour_charge && <span className="ml-3">Hourly: ₹{sub.per_hour_charge}</span>}
                      <span className="ml-3 capitalize">{sub.pricing_type} pricing</span>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="text-right mr-4">
                      {sub.provider_rate ? (
                        <div>
                          <div className="text-sm font-bold text-green-600">Your Rate: ₹{sub.provider_rate}</div>
                          <div className="text-xs text-gray-500 line-through">System: ₹{sub.base_charge}</div>
                        </div>
                      ) : (
                        <div className="text-sm font-semibold text-gray-700">₹{sub.base_charge}</div>
                      )}
                    </div>

                    {sub.created_by_provider_id !== provider.id && (
                      <button
                        onClick={() => openRateModal(sub)}
                        className="px-3 py-1.5 border border-blue-600 text-blue-600 rounded-lg text-sm hover:bg-blue-50"
                      >
                        Set Rate
                      </button>
                    )}

                    <button
                      onClick={() => startEdit(sub)}
                      disabled={sub.created_by_provider_id !== provider.id}
                      className={`px-4 py-2 rounded-lg text-sm ${sub.created_by_provider_id === provider.id
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                      {sub.created_by_provider_id === provider.id ? 'Edit' : 'System'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {selectedServiceId && (
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingSubservice ? 'Edit Sub-Service' : 'Create Sub-Service'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pricing Type</label>
                  <select
                    value={formData.pricing_type}
                    onChange={(e) => setFormData({ ...formData, pricing_type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="fixed">Fixed</option>
                    <option value="hourly">Hourly</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Base Charge (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.base_charge}
                    onChange={(e) => setFormData({ ...formData, base_charge: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Per Hour Charge (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.per_hour_charge}
                    onChange={(e) => setFormData({ ...formData, per_hour_charge: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <span className="text-sm text-gray-700">Active</span>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingSubservice ? 'Update Sub-Service' : 'Create Sub-Service'}
                </button>
                {editingSubservice && (
                  <button
                    type="button"
                    onClick={startCreate}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>
        )}
      </div>

      {rateModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Set Your Rate</h3>
            <p className="text-sm text-gray-600 mb-4">
              Set your custom minimum rate for <strong>{rateModal.sub?.name}</strong>.
              <br />
              <span className="text-xs">System Base Rate: ₹{rateModal.sub?.base_charge}</span>
            </p>
            <form onSubmit={saveRate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Rate (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={rateModal.rate}
                  onChange={(e) => setRateModal({ ...rateModal, rate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Save</button>
                <button
                  type="button"
                  onClick={() => setRateModal({ isOpen: false, sub: null, rate: '' })}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}


