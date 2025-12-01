import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'
import Header from '../components/Header' // Assuming Navbar exists

export default function Subscriptions() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [subscriptions, setSubscriptions] = useState([])
    const [user, setUser] = useState(null)
    const [subscribing, setSubscribing] = useState(null)

    useEffect(() => {
        checkUser()
        fetchSubscriptions()
    }, [])

    const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user || null)
    }

    const fetchSubscriptions = async () => {
        try {
            const { data } = await axios.get('/api/subscriptions')
            setSubscriptions(data.subscriptions)
        } catch (error) {
            console.error('Error fetching subscriptions', error)
            toast.error('Failed to load subscriptions')
        } finally {
            setLoading(false)
        }
    }

    const handleSubscribe = async (subId) => {
        if (!user) {
            router.push('/login?redirect=/subscriptions')
            return
        }

        if (!confirm('Are you sure you want to subscribe to this offer?')) return

        setSubscribing(subId)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            await axios.post('/api/users/subscriptions', { subscription_id: subId }, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            })
            toast.success('Subscribed successfully!')
            router.push('/my-subscriptions')
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to subscribe')
        } finally {
            setSubscribing(null)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Available Subscriptions</h1>
                    {user && (
                        <Link href="/my-subscriptions" className="text-blue-600 hover:text-blue-800 font-medium">
                            My Subscriptions &rarr;
                        </Link>
                    )}
                </div>

                {loading ? (
                    <div className="text-center py-10">Loading...</div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {subscriptions.map((sub) => (
                            <div key={sub.id} className="bg-white overflow-hidden shadow rounded-lg flex flex-col">
                                <div className="px-4 py-5 sm:p-6 flex-grow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900">{sub.title}</h3>
                                            <p className="text-sm text-blue-600 mb-2">{sub.provider?.business_name}</p>
                                        </div>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            {sub.service?.name}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-500">{sub.description}</p>
                                    <div className="mt-4">
                                        <span className="text-2xl font-bold text-gray-900">₹{sub.price}</span>
                                        <span className="text-gray-500"> / {sub.interval}</span>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-4 sm:px-6">
                                    <button
                                        onClick={() => handleSubscribe(sub.id)}
                                        disabled={subscribing === sub.id}
                                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                    >
                                        {subscribing === sub.id ? 'Processing...' : 'Subscribe Now'}
                                    </button>
                                </div>
                            </div>
                        ))}
                        {subscriptions.length === 0 && (
                            <div className="col-span-full text-center text-gray-500 py-10">
                                No subscription offers available at the moment.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
