import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'
import Header from '../components/Header'

export default function MySubscriptions() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [subscriptions, setSubscriptions] = useState([])
    const [canceling, setCanceling] = useState(null)

    useEffect(() => {
        checkUser()
    }, [])

    const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            router.push('/login?redirect=/my-subscriptions')
            return
        }
        fetchSubscriptions(session.access_token)
    }

    const fetchSubscriptions = async (token) => {
        try {
            const { data } = await axios.get('/api/users/subscriptions', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setSubscriptions(data.subscriptions)
        } catch (error) {
            console.error('Error fetching subscriptions', error)
            toast.error('Failed to load your subscriptions')
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = async (id) => {
        if (!confirm('Are you sure you want to cancel this subscription?')) return

        setCanceling(id)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            await axios.post(`/api/users/subscriptions/${id}/cancel`, {}, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            })
            toast.success('Subscription canceled')
            // Refresh list
            fetchSubscriptions(session.access_token)
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to cancel subscription')
        } finally {
            setCanceling(null)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">My Subscriptions</h1>

                {loading ? (
                    <div className="text-center py-10">Loading...</div>
                ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {subscriptions.map((sub) => (
                                <li key={sub.id} className="px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-lg font-medium text-gray-900 truncate">
                                                    {sub.subscription?.title}
                                                </h3>
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${sub.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    sub.status === 'canceled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {sub.status.toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                <p>Provider: {sub.subscription?.provider?.business_name}</p>
                                                <p>Service: {sub.subscription?.service?.name}</p>
                                                <p className="mt-1">
                                                    Price: ₹{sub.subscription?.price} / {sub.subscription?.interval}
                                                </p>
                                                <p>Started: {new Date(sub.started_at).toLocaleDateString()}</p>
                                                {sub.ends_at && (
                                                    <p>Ends: {new Date(sub.ends_at).toLocaleDateString()}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="ml-4 flex-shrink-0">
                                            {sub.status === 'active' && (
                                                <button
                                                    onClick={() => handleCancel(sub.id)}
                                                    disabled={canceling === sub.id}
                                                    className="font-medium text-red-600 hover:text-red-500 disabled:opacity-50"
                                                >
                                                    {canceling === sub.id ? 'Canceling...' : 'Cancel Subscription'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                            {subscriptions.length === 0 && (
                                <li className="px-6 py-10 text-center text-gray-500">
                                    You don&#39;t have any active subscriptions.
                                    <Link href="/subscriptions" className="text-blue-600 hover:text-blue-800 ml-1">
                                        Browse offers
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    )
}
