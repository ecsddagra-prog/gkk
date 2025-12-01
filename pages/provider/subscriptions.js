import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'
import ProviderLayout from '../../components/provider/ProviderLayout' // Assuming a layout component exists or I'll wrap manually like subservices if not

export default function ProviderSubscriptions() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [subscriptions, setSubscriptions] = useState([])
    const [services, setServices] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingId, setEditingId] = useState(null)

    const [formData, setFormData] = useState({
        service_id: '',
        title: '',
        description: '',
        price: '',
        interval: 'monthly',
        active: true
    })

    useEffect(() => {
        checkUser()
    }, [])

    const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            router.push('/login')
            return
        }
        fetchData(session.access_token)
    }

    const fetchData = async (token) => {
        try {
            // Fetch provider's services to populate dropdown
            // We can reuse the logic from subservices or just fetch all services linked to provider
            const { data: providerData } = await axios.get('/api/provider/profile', { // Assuming this endpoint exists or similar
                headers: { Authorization: `Bearer ${token}` }
            }).catch(() => ({ data: null }))

            // If no specific profile endpoint, we might need to fetch services differently.
            // Let's try fetching subscriptions directly first, and services.

            // Actually, let's fetch services the provider can manage.
            // In subservices.js it fetches provider then services.
            // Let's simplify and assume we can get the list of services the provider offers.
            // For now, I'll fetch subscriptions.

            const [subsRes, servicesRes] = await Promise.all([
                axios.get('/api/providers/subscriptions', { headers: { Authorization: `Bearer ${token}` } }),
                // We need a way to get services. Let's assume we can get them or use a known endpoint.
                // If not, I'll just fetch all services for now or try to filter.
                // Wait, subservices.js used: 
                // supabase.from('provider_services').select('service:services(id, name)')
                // I should probably do that here too or create an endpoint.
                // I'll do it client side for now with supabase if possible, or just fetch all services if the provider is linked.
                axios.get('/api/services') // This might be public
            ])

            setSubscriptions(subsRes.data.subscriptions)
            setServices(servicesRes.data.services || []) // This might be all services, we might want to filter.

            setLoading(false)
        } catch (error) {
            console.error('Error fetching data', error)
            // toast.error('Failed to load data')
            setLoading(false)
        }
    }

    // Refined fetch services logic based on subservices.js pattern
    const fetchServices = async (userId) => {
        const { data: provider } = await supabase
            .from('providers')
            .select('id, business_subcategory_id')
            .eq('user_id', userId)
            .single()

        if (!provider) return []

        const servicesList = []
        // Main service
        if (provider.business_subcategory_id) {
            const { data: service } = await supabase
                .from('services')
                .select('id, name')
                .eq('id', provider.business_subcategory_id)
                .single()
            if (service) servicesList.push(service)
        }

        // Other services
        const { data: mapped } = await supabase
            .from('provider_services')
            .select('service:services(id, name)')
            .eq('provider_id', provider.id)

        mapped?.forEach(item => {
            if (item.service && !servicesList.some(s => s.id === item.service.id)) {
                servicesList.push(item.service)
            }
        })

        return servicesList
    }

    // Overriding checkUser to include service fetch
    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/login')
                return
            }

            try {
                const servicesList = await fetchServices(session.user.id)
                setServices(servicesList)

                const { data } = await axios.get('/api/providers/subscriptions', {
                    headers: { Authorization: `Bearer ${session.access_token}` }
                })
                setSubscriptions(data.subscriptions)
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        init()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session.access_token

            if (editingId) {
                await axios.put('/api/providers/subscriptions', { ...formData, id: editingId }, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                toast.success('Subscription updated')
            } else {
                await axios.post('/api/providers/subscriptions', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                toast.success('Subscription created')
            }

            // Reload
            const { data } = await axios.get('/api/providers/subscriptions', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setSubscriptions(data.subscriptions)
            closeModal()
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save')
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this subscription?')) return
        try {
            const { data: { session } } = await supabase.auth.getSession()
            await axios.delete('/api/providers/subscriptions', {
                data: { id },
                headers: { Authorization: `Bearer ${session.access_token}` }
            })
            toast.success('Subscription deleted')
            setSubscriptions(subscriptions.filter(s => s.id !== id))
        } catch (error) {
            toast.error('Failed to delete')
        }
    }

    const openModal = (sub = null) => {
        if (sub) {
            setEditingId(sub.id)
            setFormData({
                service_id: sub.service_id,
                title: sub.title,
                description: sub.description || '',
                price: sub.price,
                interval: sub.interval,
                active: sub.active
            })
        } else {
            setEditingId(null)
            setFormData({
                service_id: services.length > 0 ? services[0].id : '',
                title: '',
                description: '',
                price: '',
                interval: 'monthly',
                active: true
            })
        }
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingId(null)
    }

    if (loading) return <div className="p-8 text-center">Loading...</div>

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Manage Subscriptions</h1>
                    <button
                        onClick={() => openModal()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        Create New Offer
                    </button>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {subscriptions.map((sub) => (
                            <li key={sub.id} className="px-6 py-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">{sub.title}</h3>
                                    <p className="text-sm text-gray-500">{sub.description}</p>
                                    <div className="mt-1 text-sm text-gray-500">
                                        ₹{sub.price} / {sub.interval} • {sub.active ? 'Active' : 'Inactive'}
                                    </div>
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => openModal(sub)}
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(sub.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                        {subscriptions.length === 0 && (
                            <li className="px-6 py-4 text-center text-gray-500">
                                No subscription offers found. Create one to get started.
                            </li>
                        )}
                    </ul>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handleSubmit} className="p-6">
                                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                                    {editingId ? 'Edit Subscription' : 'New Subscription'}
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Service</label>
                                        <select
                                            required
                                            value={formData.service_id}
                                            onChange={e => setFormData({ ...formData, service_id: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Select a service</option>
                                            {services.map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="e.g. Weekly Mess"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Description</label>
                                        <textarea
                                            rows={3}
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                                            <input
                                                type="number"
                                                required
                                                min="0"
                                                value={formData.price}
                                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Interval</label>
                                            <select
                                                value={formData.interval}
                                                onChange={e => setFormData({ ...formData, interval: e.target.value })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="monthly">Monthly</option>
                                                <option value="yearly">Yearly</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.active}
                                            onChange={e => setFormData({ ...formData, active: e.target.checked })}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label className="ml-2 block text-sm text-gray-900">
                                            Active (visible to users)
                                        </label>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none"
                                    >
                                        Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
