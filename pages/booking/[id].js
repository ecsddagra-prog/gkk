import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { formatCurrency, formatDateTime, getStatusLabel, getStatusColor } from '../../lib/utils'

export default function BookingDetails({ user }) {
  const router = useRouter()
  const { id } = router.query
  const [booking, setBooking] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    if (id) {
      loadBooking()
      loadMessages()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id])

  const loadBooking = async () => {
    try {
      const { data } = await supabase
        .from('bookings')
        .select(`
          *,
          service:services(*, category:service_categories(*)),
          provider:providers(*, user:users(*)),
          address:user_addresses(*),
          quotes:booking_quotes(*),
          rating:ratings(*)
        `)
        .eq('id', id)
        .single()

      setBooking(data)
      if (data?.rating) {
        setRating(data.rating.rating)
        setReview(data.rating.review_text || '')
      }
    } catch (error) {
      console.error('Error loading booking:', error)
      toast.error('Failed to load booking')
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async () => {
    try {
      const { data } = await axios.get(`/api/chat/messages?booking_id=${id}`)
      setMessages(data.messages || [])
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      const receiverId = booking.user_id === user.id 
        ? booking.provider?.user_id 
        : booking.user_id

      await axios.post('/api/chat/messages', {
        booking_id: id,
        sender_id: user.id,
        receiver_id: receiverId,
        message: newMessage
      })

      setNewMessage('')
      loadMessages()
    } catch (error) {
      toast.error('Failed to send message')
    }
  }

  const submitRating = async (e) => {
    e.preventDefault()
    if (rating < 1 || rating > 5) {
      toast.error('Please select a rating')
      return
    }

    try {
      await axios.post('/api/ratings/create', {
        booking_id: id,
        user_id: user.id,
        rating,
        review_text: review
      })

      toast.success('Rating submitted successfully')
      loadBooking()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit rating')
    }
  }

  const acceptQuote = async (quoteId) => {
    try {
      await axios.post('/api/bookings/accept-quote', {
        booking_id: id,
        quote_id: quoteId,
        accepted_by: 'user'
      })

      toast.success('Quote accepted!')
      loadBooking()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to accept quote')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Booking not found</h2>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
            Back to Dashboard
          </Link>
        </div>
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
            <h1 className="text-2xl font-bold text-blue-600">Booking #{booking.booking_number}</h1>
            <div></div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Booking Details</h2>
              <div className="space-y-3">
                <div>
                  <span className="font-semibold">Service:</span> {booking.service?.name}
                </div>
                {booking.sub_service_name && (
                  <div>
                    <span className="font-semibold">Sub-Service:</span> {booking.sub_service_name}
                  </div>
                )}
                {(booking.base_charge || booking.hourly_charge) && (
                  <div>
                    <span className="font-semibold">Charges:</span>
                    <span className="ml-2">
                      {booking.base_charge ? `₹${booking.base_charge}` : 'N/A'}
                      {booking.hourly_charge && ` • ₹${booking.hourly_charge}/hour`}
                    </span>
                  </div>
                )}
                <div>
                  <span className="font-semibold">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-sm bg-${getStatusColor(booking.status)}-100 text-${getStatusColor(booking.status)}-800`}>
                    {getStatusLabel(booking.status)}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Booking For:</span>
                  <span className="ml-2 capitalize">{booking.for_whom || 'self'}</span>
                  {booking.for_whom === 'other' && booking.other_contact && (
                    <span className="ml-2 text-sm text-gray-600">
                      {booking.other_contact.name} ({booking.other_contact.phone})
                    </span>
                  )}
                </div>
                <div>
                  <span className="font-semibold">Address:</span> {booking.service_address}
                </div>
                {booking.scheduled_date && (
                  <div>
                    <span className="font-semibold">Scheduled:</span> {formatDateTime(booking.scheduled_date)}
                  </div>
                )}
                {booking.final_price && (
                  <div>
                    <span className="font-semibold">Amount:</span> {formatCurrency(booking.final_price)}
                  </div>
                )}
                {booking.provider && (
                  <div>
                    <span className="font-semibold">Provider:</span> {booking.provider.user?.full_name || booking.provider.business_name}
                  </div>
                )}
              </div>
            </div>

            {/* Quotes */}
            {booking.quotes && booking.quotes.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Quotes</h2>
                <div className="space-y-3">
                  {booking.quotes.map(quote => (
                    <div key={quote.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold">{quote.quoted_by === 'user' ? 'Your Quote' : 'Provider Quote'}</div>
                          <div className="text-2xl font-bold text-blue-600">{formatCurrency(quote.quoted_price)}</div>
                          {quote.message && <div className="text-sm text-gray-600 mt-1">{quote.message}</div>}
                        </div>
                        {quote.quoted_by === 'provider' && !quote.is_accepted && booking.status === 'quote_sent' && (
                          <button
                            onClick={() => acceptQuote(quote.id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Accept
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chat */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Chat</h2>
              <div className="space-y-4">
                <div className="h-64 overflow-y-auto border rounded-lg p-4 space-y-3">
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.sender_id === user.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
                      }`}>
                        <div className="text-sm">{msg.message}</div>
                        <div className="text-xs mt-1 opacity-75">
                          {formatDateTime(msg.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={sendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border rounded-lg"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>

            {/* Rating */}
            {booking.status === 'completed' && !booking.rating && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Rate Your Experience</h2>
                <form onSubmit={submitRating} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`text-3xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Review (Optional)</label>
                    <textarea
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Share your experience..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Submit Rating
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Status */}
            {booking.final_price && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-bold mb-3">Payment</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-semibold">{formatCurrency(booking.final_price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      booking.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.payment_status}
                    </span>
                  </div>
                  {booking.cashback_earned > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Cashback:</span>
                      <span className="font-semibold">+{formatCurrency(booking.cashback_earned)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

