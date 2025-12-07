import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import axios from 'axios'
import toast from 'react-hot-toast'
import ProviderLayout from '../../components/provider/ProviderLayout'

export default function Broadcasts() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [subscribersCount, setSubscribersCount] = useState(0)
    const [broadcasts, setBroadcasts] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'daily_menu',
        image_url: ''
    })
    const [sending, setSending] = useState(false)

    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/login')
                return
            }
            await fetchData(session.access_token)
        }
        init()
    }, [])

    const fetchData = async (token) => {
        try {
            const [subsRes, broadcastsRes] = await Promise.all([
                axios.get('/api/provider/subscribers', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/api/provider/broadcasts', { headers: { Authorization: `Bearer ${token}` } })
            ])
            setSubscribersCount(subsRes.data.subscriber_count)
            setBroadcasts(broadcastsRes.data.broadcasts)
        } catch (error) {
            console.error(error)
            toast.error('Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSending(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const { data } = await axios.post('/api/provider/broadcast', formData, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            })
            toast.success(data.message)
            setBroadcasts([data.broadcast, ...broadcasts])
            setShowForm(false)
            setFormData({ title: '', message: '', type: 'daily_menu', image_url: '' })
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to send broadcast')
        } finally {
            setSending(false)
        }
    }

    if (loading) return <div className="p-8 text-center">Loading...</div>

    return (
        <ProviderLayout>
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Subscribers & Broadcasts</h1>
                        <p className="text-gray-500 mt-1">
                            You have <span className="font-bold text-blue-600 text-lg">{subscribersCount}</span> active subscribers.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        {showForm ? 'Cancel' : 'New Broadcast'}
                    </button>
                </div>

                {showForm && (
                    <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
                        <h2 className="text-lg font-semibold mb-4">Send Update to Subscribers</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Type</label>
                                <select
                                    required
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="daily_menu">Daily Menu</option>
                                    <option value="weekly_menu">Weekly Menu</option>
                                    <option value="offer">Special Offer</option>
                                    <option value="update">General Update</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Today's Special Lunch"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Message</label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Describe the menu or offer details..."
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Image URL (Optional)</label>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={formData.image_url}
                                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={sending || subscribersCount === 0}
                                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                                >
                                    {sending ? 'Sending...' : 'Broadcast Notification'}
                                </button>
                            </div>
                            {subscribersCount === 0 && (
                                <p className="text-sm text-red-500 text-right mt-1">Cannot broadcast without subscribers.</p>
                            )}
                        </form>
                    </div>
                )}

                <h3 className="text-xl font-bold text-gray-900 mb-4">Broadcast History</h3>
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {broadcasts.map((item) => (
                            <li key={item.id} className="px-6 py-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${item.type === 'offer' ? 'bg-purple-100 text-purple-800' :
                                                    item.type === 'daily_menu' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {item.type.replace('_', ' ').toUpperCase()}
                                            </span>
                                            <h4 className="text-lg font-medium text-gray-900">{item.title}</h4>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-500 whitespace-pre-wrap">{item.message}</p>
                                        <p className="mt-2 text-xs text-gray-400">
                                            Sent on {new Date(item.created_at).toLocaleString()} • Reached {item.sent_count} subscribers
                                        </p>
                                    </div>
                                    {item.image_url && (
                                        <img src={item.image_url} alt="" className="h-16 w-16 object-cover rounded-md ml-4" />
                                    )}
                                </div>
                            </li>
                        ))}
                        {broadcasts.length === 0 && (
                            <li className="px-6 py-8 text-center text-gray-500">
                                No broadcasts sent yet.
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </ProviderLayout>
    )
}
