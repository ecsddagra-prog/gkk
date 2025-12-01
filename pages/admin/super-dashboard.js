import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function SuperAdminDashboard({ user }) {
    const router = useRouter()
    const [profile, setProfile] = useState(null)
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProviders: 0,
        totalBookings: 0,
        totalRevenue: 0,
        totalAdmins: 0,
        totalCities: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) {
            router.push('/login')
            return
        }
        checkSuperAdminAccess()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    const checkSuperAdminAccess = async () => {
        try {
            const { data: profileData } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single()

            if (!profileData || profileData.role !== 'superadmin') {
                toast.error('Access denied. Super Admin privileges required.')
                // Redirect based on actual role
                if (profileData?.role === 'admin') {
                    router.push('/admin/dashboard')
                } else if (profileData?.role === 'provider') {
                    router.push('/provider/dashboard')
                } else {
                    router.push('/dashboard')
                }
                return
            }

            setProfile(profileData)
            loadStats()
        } catch (error) {
            console.error('Error checking super admin access:', error)
            router.push('/dashboard')
        }
    }

    const loadStats = async () => {
        try {
            const [usersRes, providersRes, bookingsRes, adminsRes, citiesRes] = await Promise.all([
                supabase.from('users').select('id', { count: 'exact', head: true }),
                supabase.from('providers').select('id', { count: 'exact', head: true }),
                supabase.from('bookings').select('id, final_price', { count: 'exact' }),
                supabase.from('users').select('id', { count: 'exact', head: true }).in('role', ['admin', 'superadmin']),
                supabase.from('cities').select('id', { count: 'exact', head: true })
            ])

            const totalRevenue = bookingsRes.data?.reduce((sum, b) => sum + (parseFloat(b.final_price) || 0), 0) || 0

            setStats({
                totalUsers: usersRes.count || 0,
                totalProviders: providersRes.count || 0,
                totalBookings: bookingsRes.count || 0,
                totalRevenue: Math.round(totalRevenue),
                totalAdmins: adminsRes.count || 0,
                totalCities: citiesRes.count || 0
            })
        } catch (error) {
            console.error('Error loading stats:', error)
            setStats({
                totalUsers: 0,
                totalProviders: 0,
                totalBookings: 0,
                totalRevenue: 0,
                totalAdmins: 0,
                totalCities: 0
            })
        } finally {
            setLoading(false)
        }
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
            {/* Header */}
            <header className="bg-gradient-to-r from-purple-600 to-purple-800 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-white">Super Admin Dashboard</h1>
                            <p className="text-purple-100 text-sm">Full platform control</p>
                        </div>
                        <div className="flex gap-4">
                            <Link href="/admin/dashboard" className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30">
                                Admin View
                            </Link>
                            <button
                                onClick={async () => {
                                    try {
                                        // Force clear local session storage
                                        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
                                        const projectRef = supabaseUrl.split('//')[1].split('.')[0]
                                        localStorage.removeItem(`sb-${projectRef}-auth-token`)

                                        // Set session to null
                                        await supabase.auth.setSession({
                                            access_token: null,
                                            refresh_token: null
                                        })
                                    } catch (error) {
                                        console.log('Logout error:', error.message)
                                    }
                                    // Force full page reload
                                    window.location.reload()
                                }}
                                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-2xl font-bold mb-2">Welcome, {profile?.full_name || 'Super Admin'}!</h2>
                    <p className="text-gray-600">You have full access to all platform features and settings</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                        <div className="text-sm text-gray-600 mb-2">Total Users</div>
                        <div className="text-3xl font-bold text-blue-600">{stats.totalUsers}</div>
                        <div className="text-xs text-gray-500 mt-1">All users</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                        <div className="text-sm text-gray-600 mb-2">Providers</div>
                        <div className="text-3xl font-bold text-green-600">{stats.totalProviders}</div>
                        <div className="text-xs text-gray-500 mt-1">Service providers</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                        <div className="text-sm text-gray-600 mb-2">Bookings</div>
                        <div className="text-3xl font-bold text-purple-600">{stats.totalBookings}</div>
                        <div className="text-xs text-gray-500 mt-1">Total bookings</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                        <div className="text-sm text-gray-600 mb-2">Revenue</div>
                        <div className="text-3xl font-bold text-orange-600">₹{stats.totalRevenue.toLocaleString()}</div>
                        <div className="text-xs text-gray-500 mt-1">Platform revenue</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                        <div className="text-sm text-gray-600 mb-2">Admins</div>
                        <div className="text-3xl font-bold text-indigo-600">{stats.totalAdmins}</div>
                        <div className="text-xs text-gray-500 mt-1">Admin users</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                        <div className="text-sm text-gray-600 mb-2">Cities</div>
                        <div className="text-3xl font-bold text-teal-600">{stats.totalCities}</div>
                        <div className="text-xs text-gray-500 mt-1">Active cities</div>
                    </div>
                </div>

                {/* Super Admin Actions */}
                <div className="mb-6">
                    <h3 className="text-xl font-bold mb-4">Super Admin Controls</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Link href="/admin/users" className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg shadow-md p-6 text-white hover:shadow-lg transition cursor-pointer">
                            <div className="text-4xl mb-4">👥</div>
                            <h3 className="text-xl font-semibold mb-2">User Management</h3>
                            <p className="text-purple-100 text-sm">Manage all users and roles</p>
                        </Link>

                        <Link href="/admin/admin-users" className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-lg shadow-md p-6 text-white hover:shadow-lg transition cursor-pointer">
                            <div className="text-4xl mb-4">🛡️</div>
                            <h3 className="text-xl font-semibold mb-2">Admin Management</h3>
                            <p className="text-indigo-100 text-sm">Create and manage admin users</p>
                        </Link>

                        <Link href="/admin/settings" className="bg-gradient-to-br from-pink-500 to-pink-700 rounded-lg shadow-md p-6 text-white hover:shadow-lg transition cursor-pointer">
                            <div className="text-4xl mb-4">⚙️</div>
                            <h3 className="text-xl font-semibold mb-2">System Settings</h3>
                            <p className="text-pink-100 text-sm">Configure platform settings</p>
                        </Link>

                        <Link href="/admin/media-manager" className="bg-gradient-to-br from-cyan-500 to-cyan-700 rounded-lg shadow-md p-6 text-white hover:shadow-lg transition cursor-pointer">
                            <div className="text-4xl mb-4">📁</div>
                            <h3 className="text-xl font-semibold mb-2">Media Manager</h3>
                            <p className="text-cyan-100 text-sm">Upload and manage files (R2)</p>
                        </Link>
                    </div>
                </div>

                {/* Standard Admin Actions */}
                <div>
                    <h3 className="text-xl font-bold mb-4">Platform Management</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Link href="/admin/cities" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
                            <div className="text-4xl mb-4">🏙️</div>
                            <h3 className="text-xl font-semibold mb-2">Manage Cities</h3>
                            <p className="text-gray-600 text-sm">Add, edit, or activate/deactivate cities</p>
                        </Link>

                        <Link href="/admin/services" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
                            <div className="text-4xl mb-4">🔧</div>
                            <h3 className="text-xl font-semibold mb-2">Manage Services</h3>
                            <p className="text-gray-600 text-sm">Manage service categories and services</p>
                        </Link>

                        <Link href="/admin/city-services" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
                            <div className="text-4xl mb-4">📍</div>
                            <h3 className="text-xl font-semibold mb-2">City Services</h3>
                            <p className="text-gray-600 text-sm">Enable/disable services per city</p>
                        </Link>

                        <Link href="/admin/providers" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
                            <div className="text-4xl mb-4">👷</div>
                            <h3 className="text-xl font-semibold mb-2">Manage Providers</h3>
                            <p className="text-gray-600 text-sm">View and manage service providers</p>
                        </Link>

                        <Link href="/admin/bookings" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
                            <div className="text-4xl mb-4">📋</div>
                            <h3 className="text-xl font-semibold mb-2">All Bookings</h3>
                            <p className="text-gray-600 text-sm">View and manage all bookings</p>
                        </Link>

                        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
                            <div className="text-4xl mb-4">📊</div>
                            <h3 className="text-xl font-semibold mb-2">Analytics</h3>
                            <p className="text-gray-600 text-sm">Platform analytics and reports</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
