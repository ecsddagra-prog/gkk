import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function ProviderAnalytics({ user }) {
    const router = useRouter()
    const [stats, setStats] = useState([])
    const [loading, setLoading] = useState(true)
    const [expandedCategory, setExpandedCategory] = useState(null)

    useEffect(() => {
        if (!user) {
            router.push('/login')
            return
        }
        checkAdminAccess()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    const checkAdminAccess = async () => {
        try {
            const { data: profile } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single()

            if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
                router.push('/dashboard')
                return
            }
            loadStats()
        } catch (error) {
            router.push('/dashboard')
        }
    }

    const loadStats = async () => {
        try {
            const token = (await supabase.auth.getSession()).data.session?.access_token
            const { data } = await axios.get('/api/admin/provider-stats', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setStats(data.stats || [])
        } catch (error) {
            console.error('Error loading provider stats:', error)
            toast.error('Failed to load provider statistics')
        } finally {
            setLoading(false)
        }
    }

    const toggleCategory = (categoryId) => {
        setExpandedCategory(expandedCategory === categoryId ? null : categoryId)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-700">
                                ← Back
                            </Link>
                            <h1 className="text-2xl font-bold text-blue-600">Provider Analytics</h1>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="text-sm text-gray-600 mb-1">Total Categories</div>
                        <div className="text-3xl font-bold text-blue-600">{stats.length}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="text-sm text-gray-600 mb-1">Total Providers</div>
                        <div className="text-3xl font-bold text-green-600">
                            {stats.reduce((sum, s) => sum + s.total, 0)}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="text-sm text-gray-600 mb-1">Online Now</div>
                        <div className="text-3xl font-bold text-purple-600">
                            {stats.reduce((sum, s) => sum + s.online, 0)}
                        </div>
                    </div>
                </div>

                {/* Category Stats */}
                <div className="space-y-4">
                    {stats.map((stat) => (
                        <div key={stat.category.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="w-full px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <span className="text-3xl">{stat.category.icon || '📦'}</span>
                                    <div className="text-left">
                                        <h3 className="text-lg font-semibold text-gray-900">{stat.category.name}</h3>
                                        <p className="text-sm text-gray-500">
                                            {stat.total} providers • {stat.online} online
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => toggleCategory(stat.category.id)}
                                        className="text-right hover:bg-gray-100 rounded-lg p-3 transition"
                                    >
                                        <div className="text-2xl font-bold text-green-600">{stat.online}</div>
                                        <div className="text-xs text-gray-500">of {stat.total}</div>
                                    </button>
                                    <button
                                        onClick={() => toggleCategory(stat.category.id)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                                    >
                                        <svg
                                            className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategory === stat.category.id ? 'rotate-180' : ''
                                                }`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Provider List */}
                            {expandedCategory === stat.category.id && (
                                <div className="border-t border-gray-200">
                                    {stat.providers.length === 0 ? (
                                        <div className="px-6 py-8 text-center text-gray-500">
                                            No providers in this category
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-200">
                                            {stat.providers.map((provider) => (
                                                <div key={provider.id} className="px-6 py-4 hover:bg-gray-50">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-3 h-3 rounded-full ${provider.is_online && provider.is_available && !provider.is_suspended
                                                                        ? 'bg-green-500'
                                                                        : 'bg-gray-300'
                                                                    }`}></div>
                                                                <div>
                                                                    <h4 className="font-medium text-gray-900">
                                                                        {provider.business_name || provider.user?.full_name || 'N/A'}
                                                                    </h4>
                                                                    <p className="text-sm text-gray-500">{provider.user?.email}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            {provider.rating && (
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-yellow-500">⭐</span>
                                                                    <span className="text-sm font-medium">{provider.rating.toFixed(1)}</span>
                                                                </div>
                                                            )}
                                                            <div className="flex gap-2">
                                                                {provider.is_suspended && (
                                                                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                                                                        Suspended
                                                                    </span>
                                                                )}
                                                                {!provider.is_available && !provider.is_suspended && (
                                                                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                                                                        Unavailable
                                                                    </span>
                                                                )}
                                                                {provider.is_online && provider.is_available && !provider.is_suspended && (
                                                                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                                                        Online
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <Link
                                                                href={`/admin/providers/${provider.id}`}
                                                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                                            >
                                                                View Details →
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
