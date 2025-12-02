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

      // Get bookings assigned to this provider
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
      toast.error('Failed to load bookings')
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

  const updateStatus = async (bookingId, newStatus) => {
    try {
      await axios.patch(`/api/bookings/${bookingId}/status`, {
        status: newStatus,
        changed_by: user.id
      })
      toast.success(`Booking marked as ${getStatusLabel(newStatus)}`)
      loadData()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const completeBooking = async (bookingId) => {
    // We can use the status update API for completion too, or keep the specific complete API if it does more (like payments)
    // Checking existing complete.js... it likely handles payment logic if any. 
    // For now, let's use the status update for consistency with the new flow, 
    // unless there's specific logic in complete.js we need.
    // Actually, let's use the new status API for all status changes to ensure history is tracked.
    updateStatus(bookingId, 'completed')
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
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {['all', 'pending', 'quote_requested', 'accepted', 'on_way', 'in_progress', 'completed'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg capitalize whitespace-nowrap ${filter === status
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
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
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

                  <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <Link
                      href={`/booking/${booking.id}`}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-center flex-1 md:flex-none"
                    >
                      View
                    </Link>

                    {/* Action Buttons based on Status */}
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => updateStatus(booking.id, 'accepted')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex-1 md:flex-none"
                      >
                        Accept
                      </button>
                    )}

                    {booking.status === 'quote_requested' && (
                      <>
                        {/* Quote Information */}
                        <div className="w-full md:w-auto bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
                          <div className="text-sm space-y-1">
                            <div className="font-semibold text-yellow-900">User's Quote</div>
                            <div className="text-2xl font-bold text-yellow-700">
                              ₹{booking.user_quoted_price}
                            </div>
                            {booking.service?.base_price && (
                              <div className="text-xs text-gray-600">
                                Base Rate: ₹{booking.service.base_price}
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Accept Button */}
                        <button
                          onClick={async () => {
                            if (confirm(`Accept user's quote of ₹${booking.user_quoted_price}?`)) {
                              try {
                                const { data: { session } } = await supabase.auth.getSession()
                                await axios.post('/api/provider/quotes/accept', {
                                  booking_id: booking.id
                                }, {
                                  headers: { Authorization: `Bearer ${session?.access_token}` }
                                })
                                toast.success('Quote accepted!')
                                loadData()
                              } catch (error) {
                                toast.error(error.response?.data?.error || 'Failed to accept quote')
                              }
                            }
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex-1 md:flex-none"
                        >
                          ✅ Accept Quote
                        </button>
                        {/* Negotiate Button */}
                        <button
                          onClick={async () => {
                            const counterPrice = prompt(`User quoted: ₹${booking.user_quoted_price}\nEnter your counter-offer:`)
                            if (counterPrice && !isNaN(counterPrice)) {
                              const message = prompt('Optional message for customer:')
                              try {
                                const { data: { session } } = await supabase.auth.getSession()
                                await axios.post('/api/provider/quotes/negotiate', {
                                  booking_id: booking.id,
                                  counter_price: parseFloat(counterPrice),
                                  message: message || ''
                                }, {
                                  headers: { Authorization: `Bearer ${session?.access_token}` }
                                })
                                toast.success('Counter-offer sent!')
                                loadData()
                              } catch (error) {
                                toast.error(error.response?.data?.error || 'Failed to send counter-offer')
                              }
                            }
                          }}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex-1 md:flex-none"
                        >
                          🔁 Counter Offer
                        </button>
                      </>
                    )}

                    {booking.status === 'accepted' && (
                      <button
                        onClick={() => updateStatus(booking.id, 'on_way')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex-1 md:flex-none"
                      >
                        On the Way
                      </button>
                    )}

                    {booking.status === 'on_way' && (
                      <button
                        onClick={() => updateStatus(booking.id, 'in_progress')}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex-1 md:flex-none"
                      >
                        Start Work
                      </button>
                    )}

                    {booking.status === 'in_progress' && (
                      <button
                        onClick={() => completeBooking(booking.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex-1 md:flex-none"
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
