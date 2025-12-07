import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'
import Header from '../../components/Header'

export default function Following() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [subscriptions, setSubscriptions] = useState([])

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/login?redirect=/user/following')
                return
            }
            fetchSubscriptions(session.access_token)
        }
        checkUser()
    }, [])

    const fetchSubscriptions = async (token) => {
        try {
            const { data } = await axios.get('/api/user/subscriptions', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setSubscriptions(data.subscriptions)
        } catch (error) {
            console.error('Error fetching following list', error)
            toast.error('Failed to load subscriptions')
        } finally {
            setLoading(false)
        }
    }

    const handleUnsubscribe = async (providerId) => {
        if (!confirm('Are you sure you want to unsubscribe from updates?')) return

        try {
            const { data: { session } } = await supabase.auth.getSession()
            await axios.post('/api/user/subscribe', { provider_id: providerId }, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            })
            toast.success('Unsubscribed successfully')
            setSubscriptions(prev => prev.filter(sub => sub.provider_id !== providerId))
        } catch (error) {
            toast.error('Failed to unsubscribe')
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Following Providers</h1>

                {loading ? (
                    <div className="text-center py-10">Loading...</div>
                ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {subscriptions.map((sub) => (
                                <li key={sub.id} className="px-6 py-4 flex items-center justify-between">
                                    <div className="flex items-center">
                                        {sub.provider?.user?.profile_picture_url ? (
                                            <img
                                                src={sub.provider.user.profile_picture_url}
                                                alt=""
                                                className="h-10 w-10 rounded-full mr-4 object-cover"
                                            />
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-4 text-gray-500">
                                                {sub.provider?.business_name?.[0]?.toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900">
                                                {sub.provider?.business_name}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                Receiving updates on menus, offers, and more.
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <button
                                            onClick={() => handleUnsubscribe(sub.provider_id)}
                                            className="ml-4 px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            Unsubscribe
                                        </button>
                                    </div>
                                </li>
                            ))}
                            {subscriptions.length === 0 && (
                                <li className="px-6 py-10 text-center text-gray-500">
                                    You are not following any providers yet.
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    )
}
