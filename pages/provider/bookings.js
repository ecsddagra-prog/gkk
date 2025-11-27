import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { formatCurrency, formatDate, getStatusLabel, getStatusColor } from '../../lib/utils'

export default function ProviderBookings({ user }) {
  const router = useRouter()
  const [provider, setProvider] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filter])

  const loadData = async () => {
    try {
      const { data: providerData } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!providerData) {
        router.push('/provider/register')
        return
      }

      setProvider(providerData)

      let query = supabase
        .from('bookings')
        .select('*, service:services(*), user:users(*)')
        .eq('provider_id', providerData.id)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data: bookingsData } = await query
      setBookings(bookingsData || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const submitQuote = async (bookingId, price, message) => {
    try {
      await axios.post('/api/bookings/quote', {
        booking_id: bookingId,
        quoted_by: 'provider',
        quoted_price: price,
        message
      })
      toast.success('Quote submitted')
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit quote')
    }
  }

  const completeBooking = async (bookingId) => {
    try {
      await axios.post('/api/bookings/complete', {
        booking_id: bookingId,
        completed_by: user.id
      })
      toast.success('Booking marked as completed')
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to complete booking')
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
            <Link href="/provider/dashboard" className="text-blue-600 hover:text-blue-700">
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
            {['all', 'pending', 'quote_requested', 'confirmed', 'in_progress', 'completed'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg capitalize ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All' : getStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600">No bookings found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => (
              <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
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
                      <div>Customer: {booking.user?.full_name}</div>
                      <div>Date: {formatDate(booking.scheduled_date || booking.created_at)}</div>
                      <div>Address: {booking.service_address}</div>
                      {booking.final_price && (
                        <div className="font-semibold text-green-600">
                          Amount: {formatCurrency(booking.final_price)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/booking/${booking.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      View
                    </Link>
                    {booking.status === 'quote_requested' && (
                      <button
                        onClick={() => {
                          const price = prompt('Enter your quote price:')
                          if (price) {
                            submitQuote(booking.id, parseFloat(price), '')
                          }
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Quote
                      </button>
                    )}
                    {booking.status === 'in_progress' && (
                      <button
                        onClick={() => completeBooking(booking.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

