
import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'

export default function ServiceManagement() {
    const [services, setServices] = useState([])
    const [requests, setRequests] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [showRequestModal, setShowRequestModal] = useState(false)
    const [requestForm, setRequestForm] = useState({
        service_name: '',
        category_id: '',
        description: ''
    })
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const headers = { Authorization: `Bearer ${session?.access_token}` }

            const [servicesRes, requestsRes, categoriesRes] = await Promise.all([
                axios.get('/api/provider/services', { headers }),
                axios.get('/api/provider/service-requests', { headers }).catch(() => ({ data: { requests: [] } })),
                axios.get('/api/catalog/categories').catch(() => ({ data: { categories: [] } }))
            ])

            setServices(servicesRes.data.services)
            setRequests(requestsRes.data.requests || [])
            setCategories(categoriesRes.data.categories || [])
        } catch (error) {
            console.error('Error fetching data:', error)
            toast.error('Failed to load services')
        } finally {
            setLoading(false)
        }
    }

    const handleUpdate = async (service) => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            await axios.put('/api/provider/services', {
                service_id: service.id,
                is_enabled: service.is_enabled,
                base_price: service.provider_price,
                inspection_fee: service.inspection_fee,
                emergency_fee: service.emergency_fee
            }, {
                headers: { Authorization: `Bearer ${session?.access_token}` }
            })
            toast.success('Service updated successfully')
        } catch (error) {
            console.error('Error updating service:', error)
            toast.error('Failed to update service')
        }
    }

    const handleChange = (id, field, value) => {
        setServices(services.map(s =>
            s.id === id ? { ...s, [field]: value } : s
        ))
    }

    const handleRequestSubmit = async (e) => {
        e.preventDefault()
        if (!requestForm.service_name) {
            toast.error('Service name is required')
            return
        }

        setSubmitting(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            await axios.post('/api/provider/service-requests', requestForm, {
                headers: { Authorization: `Bearer ${session?.access_token}` }
            })
            toast.success('Request submitted successfully')
            setShowRequestModal(false)
            setRequestForm({ service_name: '', category_id: '', description: '' })
            fetchData() // Refresh requests
        } catch (error) {
            console.error('Error submitting request:', error)
            toast.error('Failed to submit request')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="p-4">Loading services...</div>

    return (
        <div className="space-y-8">
            {/* Active Services Section */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">My Services</h2>
                    <button
                        onClick={() => setShowRequestModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                        Request New Service
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pricing (₹)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {services.map(service => (
                                <tr key={service.id} className={service.is_enabled ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{service.name}</div>
                                        <div className="text-xs text-gray-500">{service.service_categories?.name}</div>

                                        {/* Subservices List */}
                                        {service.subservices && service.subservices.length > 0 && (
                                            <div className="mt-2 pl-2 border-l-2 border-gray-200">
                                                <div className="text-xs font-medium text-gray-500 mb-1">Sub-services:</div>
                                                <ul className="text-xs text-gray-600 space-y-1">
                                                    {service.subservices.map(sub => (
                                                        <li key={sub.id} className="flex items-center gap-2">
                                                            <span>• {sub.name}</span>
                                                            <span className="text-gray-400">
                                                                (₹{sub.base_charge} {sub.pricing_type === 'hourly' ? '/hr' : ''})
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap align-top">
                                        <button
                                            onClick={() => handleChange(service.id, 'is_enabled', !service.is_enabled)}
                                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${service.is_enabled ? 'bg-green-600' : 'bg-gray-200'
                                                }`}
                                        >
                                            <span
                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${service.is_enabled ? 'translate-x-5' : 'translate-x-0'
                                                    }`}
                                            />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap align-top">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <label className="text-xs text-gray-500 w-20">Base:</label>
                                                <input
                                                    type="number"
                                                    value={service.provider_price}
                                                    onChange={(e) => handleChange(service.id, 'provider_price', parseFloat(e.target.value))}
                                                    className="w-24 px-2 py-1 text-sm border rounded focus:ring-blue-500 focus:border-blue-500"
                                                    disabled={!service.is_enabled}
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <label className="text-xs text-gray-500 w-20">Inspection:</label>
                                                <input
                                                    type="number"
                                                    value={service.inspection_fee}
                                                    onChange={(e) => handleChange(service.id, 'inspection_fee', parseFloat(e.target.value))}
                                                    className="w-24 px-2 py-1 text-sm border rounded focus:ring-blue-500 focus:border-blue-500"
                                                    disabled={!service.is_enabled}
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <label className="text-xs text-gray-500 w-20">Emergency:</label>
                                                <input
                                                    type="number"
                                                    value={service.emergency_fee}
                                                    onChange={(e) => handleChange(service.id, 'emergency_fee', parseFloat(e.target.value))}
                                                    className="w-24 px-2 py-1 text-sm border rounded focus:ring-blue-500 focus:border-blue-500"
                                                    disabled={!service.is_enabled}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap align-top">
                                        <button
                                            onClick={() => handleUpdate(service)}
                                            className="text-blue-600 hover:text-blue-900 font-medium text-sm"
                                        >
                                            Save
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Service Requests Section */}
            {requests.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800">My Service Requests</h2>
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {requests.map(req => (
                                    <tr key={req.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {req.service_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {categories.find(c => c.id === req.category_id)?.name || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${req.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    req.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(req.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Request Modal */}
            {showRequestModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-bold mb-4">Request New Service</h3>
                        <form onSubmit={handleRequestSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Service Name *</label>
                                <input
                                    type="text"
                                    value={requestForm.service_name}
                                    onChange={e => setRequestForm({ ...requestForm, service_name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    value={requestForm.category_id}
                                    onChange={e => setRequestForm({ ...requestForm, category_id: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={requestForm.description}
                                    onChange={e => setRequestForm({ ...requestForm, description: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    rows={3}
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowRequestModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
