import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'

export default function SubscribeButton({ providerId, onSubscriptionChange }) {
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (providerId) {
            checkSubscription()
        }
    }, [providerId])

    const checkSubscription = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const { data } = await axios.get(`/api/user/subscribe?provider_id=${providerId}`, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            })
            setIsSubscribed(data.is_subscribed)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const toggleSubscription = async () => {
        setLoading(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                toast.error('Please login to subscribe')
                return
            }

            const { data } = await axios.post('/api/user/subscribe',
                { provider_id: providerId },
                { headers: { Authorization: `Bearer ${session.access_token}` } }
            )
            setIsSubscribed(data.is_subscribed)
            toast.success(data.message)
            if (onSubscriptionChange) {
                onSubscriptionChange(data.is_subscribed)
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update subscription')
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <button className="opacity-50 px-4 py-2 rounded bg-gray-200">...</button>

    return (
        <button
            onClick={toggleSubscription}
            className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${isSubscribed
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
        >
            {isSubscribed ? 'Subscribed' : 'Subscribe'}
        </button>
    )
}
