import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function AdminDashboard({ user }) {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProviders: 0,
    totalBookings: 0,
    totalRevenue: 0
  })
  const [loading, setLoading] = useState(true)

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
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!profileData || (profileData.role !== 'admin' && profileData.role !== 'superadmin')) {
        toast.error('Access denied. Admin privileges required.')
        router.push('/dashboard')
        return
      }

      setProfile(profileData)
      loadStats()
    } catch (error) {
      console.error('Error checking admin access:', error)
      router.push('/dashboard')
    }
  }

  const loadStats = async () => {
    try {
      // Use API endpoints with service role for admin stats (bypasses RLS)
      const token = (await supabase.auth.getSession()).data.session?.access_token

      // Get stats via API or direct queries
      const [usersRes, providersRes, bookingsRes] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('providers').select('id', { count: 'exact', head: true }),
        supabase.from('bookings').select('id, final_price', { count: 'exact' })
      ])

      const totalRevenue = bookingsRes.data?.reduce((sum, b) => sum + (parseFloat(b.final_price) || 0), 0) || 0

      setStats({
        totalUsers: usersRes.count || 0,
        totalProviders: providersRes.count || 0,
        totalBookings: bookingsRes.count || 0,
        totalRevenue: Math.round(totalRevenue)
      })
    } catch (error) {
      console.error('Error loading stats:', error)
      // Set default values on error
      setStats({
        totalUsers: 0,
        totalProviders: 0,
        totalBookings: 0,
        totalRevenue: 0
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
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">Admin Dashboard</h1>
            <div className="flex gap-4">
              {profile?.role === 'superadmin' && (
                <Link href="/admin/super-dashboard" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  Super Admin
                </Link>
              )}
              <button
                onClick={() => {
                  supabase.auth.signOut()
                  router.push('/')
                }}
                className="px-4 py-2 text-gray-700 hover:text-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Welcome, {profile?.full_name || 'Admin'}!</h2>
          <p className="opacity-90">Manage your platform from here</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="text-sm text-gray-600 mb-2">Total Users</div>
            <div className="text-3xl font-bold text-blue-600">{stats.totalUsers}</div>
            <div className="text-xs text-gray-500 mt-1">Registered users</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="text-sm text-gray-600 mb-2">Total Providers</div>
            <div className="text-3xl font-bold text-green-600">{stats.totalProviders}</div>
            <div className="text-xs text-gray-500 mt-1">Service providers</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="text-sm text-gray-600 mb-2">Total Bookings</div>
            <div className="text-3xl font-bold text-purple-600">{stats.totalBookings}</div>
            <div className="text-xs text-gray-500 mt-1">All bookings</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="text-sm text-gray-600 mb-2">Total Revenue</div>
            <div className="text-3xl font-bold text-orange-600">₹{stats.totalRevenue.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">Platform revenue</div>
          </div>
        </div>

        {/* Admin Actions */}
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
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2">Manage Providers</h3>
            <p className="text-gray-600 text-sm">View and manage service providers</p>
          </Link>

          <Link href="/admin/bookings" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-2">All Bookings</h3>
            <p className="text-gray-600 text-sm">View and manage all bookings</p>
          </Link>

          <Link href="/admin/settings" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
            <div className="text-4xl mb-4">⚙️</div>
            <h3 className="text-xl font-semibold mb-2">Settings</h3>
            <p className="text-gray-600 text-sm">Configure platform settings</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

