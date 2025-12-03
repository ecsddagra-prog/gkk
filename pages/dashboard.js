import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import axios from 'axios'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate } from '../lib/utils'

export default function Dashboard({ user }) {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    loadData()

    // Real-time subscription
    const subscription = supabase
      .channel('dashboard-bookings')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('🔔 Dashboard booking update:', payload)
        loadData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadData = async () => {
    try {
      // Check if session still exists before making queries
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      // Load user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      // If error or no profile data, redirect to login
      if (profileError || !profileData) {
        router.push('/login')
        return
      }

      setProfile(profileData)

      // Redirect based on user role
      console.log('Dashboard: User Role:', profileData.role)
      if (profileData.role === 'superadmin' || profileData.role === 'admin') {
        router.replace('/admin/dashboard')
        return
      } else if (profileData.role === 'provider') {
        // Only redirect if they have a provider record
        const { data: providerRecord, error: providerError } = await supabase
          .from('providers')
          .select('id')
          .eq('user_id', user.id)
          .single()

        console.log('Dashboard: Provider Record:', providerRecord, 'Error:', providerError)

        if (providerRecord) {
          console.log('Dashboard: Redirecting to provider dashboard')
          router.replace('/provider/dashboard')
          return
        }
        // If no provider record, treat as normal user (allow access to dashboard)
      }
      // If user role is 'user', continue showing this dashboard

      // Load bookings
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*, service:services(*), provider:providers!bookings_provider_id_fkey(*, user:users(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      setBookings(bookingsData || [])
    } catch (error) {
      console.error('Error loading data:', error)
      // Don't show error toast if it's just a session issue
      if (!error.message?.includes('session')) {
        toast.error('Failed to load data')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
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
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">Home Solution</h1>
            <div className="flex gap-4 items-center">
              <Link href="/book-service" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Book Service
              </Link>
              <button onClick={handleLogout} className="px-4 py-2 text-gray-700 hover:text-red-600">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Welcome, {profile?.full_name || 'User'}!</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Link href="/wallet" className="bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition cursor-pointer">
              <div className="text-sm text-gray-600">Wallet Balance</div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(profile?.wallet_balance || 0)}
              </div>
            </Link>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Total Cashback</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(profile?.total_cashback || 0)}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Reward Points</div>
              <div className="text-2xl font-bold text-purple-600">
                {profile?.total_rewards || 0} pts
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <Link href="/profile" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              My Profile
            </Link>
            <Link href="/addresses" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              My Addresses
            </Link>
            <Link href="/bookings" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              All Bookings
            </Link>
            {profile?.role === 'admin' || profile?.role === 'superadmin' ? (
              <Link href="/admin/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Admin Dashboard
              </Link>
            ) : null}
            {profile?.role === 'provider' ? (
              <Link href="/provider/dashboard" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Provider Dashboard
              </Link>
            ) : profile?.role === 'user' ? (
              <Link href="/provider/register" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Become a Provider
              </Link>
            ) : null}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Link href="/book-service" className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition text-center">
            <div className="text-2xl mb-2">➕</div>
            <div className="font-semibold text-sm">Book Service</div>
          </Link>
          <Link href="/bookings" className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition text-center">
            <div className="text-2xl mb-2">📋</div>
            <div className="font-semibold text-sm">All Bookings</div>
          </Link>
          <Link href="/wallet" className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition text-center">
            <div className="text-2xl mb-2">💰</div>
            <div className="font-semibold text-sm">Wallet</div>
          </Link>
          <Link href="/addresses" className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition text-center">
            <div className="text-2xl mb-2">📍</div>
            <div className="font-semibold text-sm">Addresses</div>
          </Link>
        </div>

        {/* Bookings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Recent Bookings</h2>
            <Link href="/bookings" className="text-blue-600 hover:text-blue-700 text-sm">
              View All →
            </Link>
          </div>
          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No bookings yet</p>
              <Link href="/book-service" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block">
                Book your first service
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map(booking => (
                <div key={booking.id} className="border rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{booking.service?.name}</h3>
                      <p className="text-sm text-gray-600">Booking #: {booking.booking_number}</p>
                      <p className="text-sm text-gray-600">
                        Date: {formatDate(booking.scheduled_date || booking.created_at)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Status: <span className="capitalize">{booking.status.replace('_', ' ')}</span>
                      </p>
                      {booking.provider && (
                        <p className="text-sm text-gray-600">
                          Provider: {booking.provider.user?.full_name || booking.provider.business_name || 'Not assigned'}
                        </p>
                      )}
                      {booking.final_price && (
                        <p className="text-sm font-semibold text-green-600 mt-1">
                          Amount: {formatCurrency(booking.final_price)}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Link
                        href={`/booking/${booking.id}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm whitespace-nowrap"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
