import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import Link from 'next/link'
import { formatCurrency, formatDate, getStatusLabel, getStatusColor } from '../lib/utils'

export default function Bookings({ user }) {
  const router = useRouter()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    loadBookings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filter])

  const loadBookings = async () => {
    try {
      console.log('🔍 Loading bookings for user:', user)
      console.log('📊 User ID:', user?.id)
      console.log('📧 User email:', user?.email)

      // Check current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      console.log('🔐 Current session:', session)
      console.log('🆔 Session user ID:', session?.user?.id)

      if (sessionError) {
        console.error('❌ Session error:', sessionError)
      }

      if (!session) {
        console.error('❌ No active session found!')
        return
      }

      let query = supabase
        .from('bookings')
        .select('*, service:services(*), provider:providers!bookings_provider_id_fkey(*, user:users(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      console.log('📡 Executing query with filter:', filter)
      const { data, error } = await query

      if (error) {
        console.error('❌ Query error:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
      }

      console.log('✅ Query result:', data)
      console.log('📊 Bookings count:', data?.length || 0)

      setBookings(data || [])
    } catch (error) {
      console.error('Error loading bookings:', error)
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
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-blue-600">My Bookings</h1>
            <div></div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-2">
            {['all', 'pending', 'confirmed', 'in_progress', 'completed'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg capitalize ${filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {status === 'all' ? 'All' : getStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 mb-4">No bookings found</p>
            <Link href="/book-service" className="text-blue-600 hover:text-blue-700">
              Book a service
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => (
              <div key={booking.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-xl font-semibold">{booking.service?.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-sm bg-${getStatusColor(booking.status)}-100 text-${getStatusColor(booking.status)}-800`}>
                        {getStatusLabel(booking.status)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Booking #: {booking.booking_number}</div>
                      <div>Date: {formatDate(booking.scheduled_date || booking.created_at)}</div>
                      <div>Address: {booking.service_address}</div>
                      {booking.provider && (
                        <div>Provider: {booking.provider.user?.full_name || booking.provider.business_name}</div>
                      )}
                      {booking.final_price && (
                        <div className="font-semibold text-green-600">
                          Amount: {formatCurrency(booking.final_price)}
                        </div>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/booking/${booking.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

