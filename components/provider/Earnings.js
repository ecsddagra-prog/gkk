import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function Earnings({ user }) {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState(null)
    const [transactions, setTransactions] = useState([])
    const [reviews, setReviews] = useState([])

    useEffect(() => {
        if (user) {
            loadStats()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    const loadStats = async () => {
        try {
            const token = (await supabase.auth.getSession()).data.session?.access_token
            const { data } = await axios.get('/api/provider/stats', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setStats(data.stats)
            setTransactions(data.recentTransactions)
            setReviews(data.recentReviews)
        } catch (error) {
            console.error('Error loading stats:', error)
            toast.error('Failed to load earnings data')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Earnings & Performance</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                    <p className="text-sm text-gray-500">Total Earnings</p>
                    <p className="text-2xl font-bold text-gray-900">₹{stats?.totalEarnings?.toLocaleString() || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
                    <p className="text-sm text-gray-500">Pending Clearance</p>
                    <p className="text-2xl font-bold text-gray-900">₹{stats?.pendingEarnings?.toLocaleString() || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                    <p className="text-sm text-gray-500">Completed Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.orderCounts?.completed || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
                    <p className="text-sm text-gray-500">Cancelled Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.orderCounts?.cancelled || 0}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Transactions */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="px-6 py-4 border-b">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                                            No completed transactions yet
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((tx) => (
                                        <tr key={tx.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {tx.service?.name || 'Service'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(tx.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600">
                                                +₹{tx.final_price}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Customer Reviews */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="px-6 py-4 border-b">
                        <h2 className="text-lg font-semibold text-gray-900">Customer Reviews</h2>
                    </div>
                    <div className="divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
                        {reviews.length === 0 ? (
                            <div className="p-6 text-center text-sm text-gray-500">
                                No reviews yet
                            </div>
                        ) : (
                            reviews.map((review) => (
                                <div key={review.id} className="p-6 hover:bg-gray-50">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="font-medium text-gray-900">
                                                {review.user?.full_name || 'Anonymous'}
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                • {new Date(review.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex text-yellow-400 text-sm">
                                            {'★'.repeat(Math.round(review.rating))}
                                            <span className="text-gray-300">
                                                {'★'.repeat(5 - Math.round(review.rating))}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 italic">
                                        &quot;{review.review_text || 'No comment provided'}&quot;
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
