import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'
import SubscribeButton from '../../components/user/SubscribeButton'
import { formatCurrency, formatDateTime, getStatusLabel, getStatusColor } from '../../lib/utils'

// Status Badge Component with proper color mapping
const StatusBadge = ({ status }) => {
  const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    quote_requested: 'bg-blue-100 text-blue-800 border-blue-200',
    quote_sent: 'bg-purple-100 text-purple-800 border-purple-200',
    quote_accepted: 'bg-green-100 text-green-800 border-green-200',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
    in_progress: 'bg-orange-100 text-orange-800 border-orange-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    disputed: 'bg-orange-100 text-orange-800 border-orange-200'
  }

  const style = statusStyles[status] || 'bg-gray-100 text-gray-800 border-gray-200'

  return (
    <div className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${style} capitalize shadow-sm`}>
      {getStatusLabel(status)}
    </div>
  )
}

export default function BookingDetails({ user }) {
  const router = useRouter()
  const { id } = router.query
  const [booking, setBooking] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)

  // Review State
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')
  const [criteriaRatings, setCriteriaRatings] = useState({
    behavior: 0,
    nature: 0,
    work_knowledge: 0,
    work_quality: 0,
    punctuality: 0
  })
  const [reviewImages, setReviewImages] = useState([])
  const [uploading, setUploading] = useState(false)

  // Bi-directional Rating State
  const [userRating, setUserRating] = useState(null)
  const [providerRating, setProviderRating] = useState(null)
  const [hasRatedBefore, setHasRatedBefore] = useState(false)

  // Payment State
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    if (id) {
      loadBooking()
      loadMessages()
      subscribeToBookingUpdates()
    }
    // Load Razorpay script
    loadRazorpayScript()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id])

  const loadRazorpayScript = () => {
    if (typeof window !== 'undefined' && !window.Razorpay) {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      script.onload = () => setRazorpayLoaded(true)
      document.body.appendChild(script)
    } else if (window.Razorpay) {
      setRazorpayLoaded(true)
    }
  }

  const subscribeToBookingUpdates = () => {
    const subscription = supabase
      .channel(`booking-${id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'bookings',
        filter: `id=eq.${id}`
      }, (payload) => {
        console.log('📡 Booking update received:', payload)
        setBooking(prev => ({ ...prev, ...payload.new }))

        // Show toast for status changes
        if (payload.new.status !== payload.old?.status) {
          const statusMessages = {
            'confirmed': '✅ Booking confirmed by provider!',
            'in_progress': '🔧 Provider has started the work',
            'completed': '✨ Booking completed! Please rate your experience.',
            'cancelled': '❌ Booking has been cancelled'
          }
          const message = statusMessages[payload.new.status] || `📢 Booking status updated to ${payload.new.status}`
          toast.success(message, { duration: 5000 })
        }
      })
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status)
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to booking updates')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Realtime subscription error - check if realtime is enabled')
        }
      })

    return () => {
      console.log('📡 Unsubscribing from booking updates')
      supabase.removeChannel(subscription)
    }
  }

  const loadBooking = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          service:services(*, category:service_categories(*)),
          provider:providers!bookings_provider_id_fkey(*, user:users(*)),
          address:user_addresses(*),
          quotes:booking_quotes(*),
          ratings(*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      // Fetch history separately to avoid blocking main booking load
      const { data: history, error: historyError } = await supabase
        .from('booking_status_history')
        .select('*')
        .eq('booking_id', id)
        .order('created_at', { ascending: true })

      if (historyError) {
        console.error('Error loading history:', historyError)
      }

      setBooking({ ...data, history: history || [] })

      // Handle ratings
      if (data?.ratings) {
        // ratings is an array now
        console.log('📊 Raw ratings data:', data.ratings)
        const ratings = Array.isArray(data.ratings) ? data.ratings : [data.ratings]
        console.log('📊 Processed ratings array:', ratings)

        const uRating = ratings.find(r => r.rated_by === 'user' || !r.rated_by)
        const pRating = ratings.find(r => r.rated_by === 'provider')

        console.log('👤 User rating found:', uRating)
        console.log('👷 Provider rating found:', pRating)

        setUserRating(uRating)
        setProviderRating(pRating)

        // Determine my rating to pre-fill form or show display
        const isProvider = data.provider?.user_id === user.id
        const myRating = isProvider ? pRating : uRating

        if (myRating) {
          setRating(myRating.rating)
          setReview(myRating.review_text || '')
          setCriteriaRatings({
            behavior: myRating.behavior_rating || 0,
            nature: myRating.nature_rating || 0,
            work_knowledge: myRating.work_knowledge_rating || 0,
            work_quality: myRating.work_quality_rating || 0,
            punctuality: myRating.punctuality_rating || 0
          })
          setReviewImages(myRating.review_photos || [])
        } else {
          // Check if rated in ANY booking
          await checkGlobalRating(data)
        }
      }
    } catch (error) {
      console.error('Error loading booking:', error)
      toast.error('Failed to load booking')
    } finally {
      setLoading(false)
    }
  }

  const checkGlobalRating = async (bookingData) => {
    if (!bookingData || !user || !bookingData.provider_id) return

    const isProvider = bookingData.provider?.user_id === user.id
    const ratedBy = isProvider ? 'provider' : 'user'

    try {
      const { data } = await axios.get('/api/ratings/check', {
        params: {
          user_id: bookingData.user_id,
          provider_id: bookingData.provider_id,
          rated_by: ratedBy
        }
      })

      if (data.hasRated) {
        setHasRatedBefore(true)
      }
    } catch (error) {
      console.error('Error checking global rating:', error)
    }
  }

  const loadMessages = async () => {
    try {
      setMessagesLoading(true)
      const { data } = await axios.get(`/api/chat/messages?booking_id=${id}`)
      setMessages(data.messages || [])
    } catch (error) {
      console.error('Error loading messages:', error)
      toast.error('Failed to load messages')
    } finally {
      setMessagesLoading(false)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const messageToSend = newMessage
    setNewMessage('') // Clear input immediately for better UX

    try {
      const receiverId = booking.user_id === user.id
        ? booking.provider?.user_id
        : booking.user_id

      await axios.post('/api/chat/messages', {
        booking_id: id,
        sender_id: user.id,
        receiver_id: receiverId,
        message: messageToSend
      })

      toast.success('Message sent')
      loadMessages()
    } catch (error) {
      console.error('Send message error:', error)
      toast.error('Failed to send message')
      setNewMessage(messageToSend) // Restore message on error
    }
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploading(true)
    const uploadedUrls = []

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `reviews/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('reviews')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('reviews')
          .getPublicUrl(fileName)

        uploadedUrls.push(publicUrl)
      }

      setReviewImages(prev => [...prev, ...uploadedUrls])
      toast.success('Images uploaded')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  const submitRating = async (e) => {
    e.preventDefault()
    if (rating < 1 || rating > 5) {
      toast.error('Please select an overall rating')
      return
    }

    const ratedBy = booking.provider?.user_id === user.id ? 'provider' : 'user'
    console.log('📝 Submitting rating:', {
      bookingProviderId: booking.provider?.user_id,
      currentUserId: user.id,
      determinedRatedBy: ratedBy
    })

    try {
      await axios.post('/api/ratings/create', {
        booking_id: id,
        user_id: user.id,
        rating,
        review_text: review,
        review_photos: reviewImages,
        behavior_rating: criteriaRatings.behavior,
        nature_rating: criteriaRatings.nature,
        work_knowledge_rating: criteriaRatings.work_knowledge,
        work_quality_rating: criteriaRatings.work_quality,
        punctuality_rating: criteriaRatings.punctuality,
        rated_by: ratedBy
      })

      toast.success('Rating submitted successfully')
      loadBooking()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit rating')
    }
  }

  const handlePayment = async () => {
    if (!booking?.final_price) {
      toast.error('Booking amount not found')
      return
    }

    if (!razorpayLoaded) {
      toast.error('Payment system is loading, please try again')
      return
    }

    setPaymentProcessing(true)

    try {
      // Create payment order
      const { data: orderData } = await axios.post('/api/payments/create-order', {
        booking_id: id,
        amount: booking.final_price,
        wallet_used: 0 // Can be enhanced to support wallet later
      })

      // If payment completed via wallet
      if (orderData.message === 'Payment completed via wallet') {
        toast.success('Payment completed successfully!')
        loadBooking()
        setPaymentProcessing(false)
        return
      }

      // Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'Service Payment',
        description: `Payment for Booking #${booking.booking_number}`,
        order_id: orderData.order.id,
        handler: async function (response) {
          try {
            // Verify payment
            await axios.post('/api/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              booking_id: id
            })

            toast.success('Payment successful!')
            loadBooking()
          } catch (error) {
            console.error('Payment verification error:', error)
            toast.error('Payment verification failed')
          } finally {
            setPaymentProcessing(false)
          }
        },
        prefill: {
          name: user.full_name,
          email: user.email,
          contact: user.phone || ''
        },
        theme: {
          color: '#2563eb'
        },
        modal: {
          ondismiss: function () {
            setPaymentProcessing(false)
            toast.error('Payment cancelled')
          }
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error('Payment error:', error)
      toast.error(error.response?.data?.error || 'Failed to initiate payment')
      setPaymentProcessing(false)
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

  const renderStars = (value, onChange, size = 'text-2xl') => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange && onChange(star)}
          disabled={!onChange}
          className={`${size} ${star <= value ? 'text-yellow-400' : 'text-gray-300'} focus:outline-none transition-colors`}
        >
          ★
        </button>
      ))}
    </div>
  )

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
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex justify-between items-center gap-6">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Booking #{booking.booking_number}</h1>
            <StatusBadge status={booking.status} />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile-optimized grid: stacks vertically on mobile, 3-column on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-6">

            {/* Status Timeline - Enhanced Premium Design */}
            <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-xl font-bold mb-6 text-gray-900 border-b pb-3">Booking Status</h2>
              <div className="flex items-center justify-between">
                {['pending', 'confirmed', 'in_progress', 'completed'].map((step, index) => {
                  const steps = ['pending', 'confirmed', 'in_progress', 'completed']
                  const currentIdx = steps.indexOf(booking.status)
                  const stepIdx = steps.indexOf(step)
                  const isActive = stepIdx <= currentIdx
                  const isCurrent = stepIdx === currentIdx

                  return (
                    <div key={step} className="flex flex-col items-center flex-1 relative group">
                      {/* Circle Indicator - Larger with Animation */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 z-10 transition-all duration-500 transform ${isCurrent
                        ? 'bg-blue-600 text-white shadow-lg scale-110 ring-4 ring-blue-200 animate-pulse'
                        : isActive
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-200 text-gray-400 opacity-50'
                        }`}>
                        {isActive ? (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="text-sm font-semibold">{index + 1}</span>
                        )}
                      </div>

                      {/* Step Label */}
                      <span className={`capitalize text-sm font-semibold transition-colors duration-300 ${isCurrent
                        ? 'text-blue-700 font-bold'
                        : isActive
                          ? 'text-blue-600'
                          : 'text-gray-400'
                        }`}>
                        {getStatusLabel(step)}
                      </span>

                      {/* Timestamp Tooltip */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:block w-max max-w-[200px] p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-20 text-center">
                        {(() => {
                          const historyEntry = booking.history?.find(h => h.status === step)
                          if (historyEntry) {
                            return `${getStatusLabel(step)} on ${formatDateTime(historyEntry.created_at)}`
                          }
                          return isActive ? 'Completed' : 'Not yet reached'
                        })()}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                      </div>

                      {/* Connecting Line */}
                      {index < steps.length - 1 && (
                        <div className={`absolute top-6 left-1/2 w-full h-1 -z-0 rounded-full transition-all duration-500 ${stepIdx < currentIdx ? 'bg-blue-600' : 'bg-gray-200'
                          }`} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Service Details - Enhanced Card */}
            <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <h2 className="text-xl font-bold mb-4 text-gray-900 border-b pb-3">Service Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="text-sm text-gray-500 font-medium mb-1">Service</label>
                  <div className="font-semibold text-gray-900">{booking.service?.name}</div>
                </div>
                {booking.sub_service_name && (
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-500 font-medium mb-1">Sub-Service</label>
                    <div className="font-semibold text-gray-900">{booking.sub_service_name}</div>
                  </div>
                )}
                <div className="flex flex-col">
                  <label className="text-sm text-gray-500 font-medium mb-1">Date & Time</label>
                  <div className="font-semibold text-gray-900">{formatDateTime(booking.scheduled_date)}</div>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm text-gray-500 font-medium mb-1">Address</label>
                  <div className="font-semibold text-gray-900">{booking.service_address}</div>
                </div>
                {booking.provider && (
                  <div className="md:col-span-2 pt-4 border-t mt-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm text-gray-500 font-medium">Provider</label>
                      <SubscribeButton providerId={booking.provider.id} />
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      {booking.provider.user?.avatar_url ? (
                        <img src={booking.provider.user.avatar_url} alt="" className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                          {booking.provider.user?.full_name?.[0]}
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{booking.provider.user?.full_name || booking.provider.business_name}</div>
                        <div className="text-sm text-gray-500">Verified Provider</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quotes */}
            {booking.quotes && booking.quotes.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <h2 className="text-xl font-bold mb-4 text-gray-900 border-b pb-3">Quotes</h2>
                <div className="space-y-4">
                  {booking.quotes.map(quote => (
                    <div key={quote.id} className="border-2 border-gray-200 rounded-xl p-5 bg-gradient-to-br from-gray-50 to-white hover:border-blue-300 transition-colors">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-gray-700 mb-1">{quote.quoted_by === 'user' ? 'Your Quote' : 'Provider Quote'}</div>
                          <div className="text-3xl font-bold text-blue-600">{formatCurrency(quote.quoted_price)}</div>
                          {quote.message && <div className="text-sm text-gray-600 mt-2 italic">{quote.message}</div>}
                        </div>
                        {quote.quoted_by === 'provider' && !quote.is_accepted && booking.status === 'quote_sent' && (
                          <button
                            onClick={() => acceptQuote(quote.id)}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 font-semibold shadow-md"
                          >
                            Accept Quote
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rating Section - Bi-Directional */}
            {booking.status === 'completed' && (
              <div className="space-y-6">
                {(() => {
                  const isProvider = booking.provider?.user_id === user.id
                  const myRating = isProvider ? providerRating : userRating
                  const theirRating = isProvider ? userRating : providerRating
                  const theirName = isProvider ? booking.user?.full_name : (booking.provider?.business_name || booking.provider?.user?.full_name)

                  return (
                    <>
                      {/* My Rating */}
                      {!myRating && !hasRatedBefore && (
                        <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow duration-300">
                          <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b pb-3">
                            {myRating ? 'Your Review' : (isProvider ? 'Rate User' : 'Rate Provider')}
                          </h2>

                          {myRating ? (
                            <div className="space-y-6">
                              <div className="flex items-center gap-4">
                                <div className="text-4xl font-bold text-gray-900">{myRating.rating.toFixed(1)}</div>
                                <div>
                                  {renderStars(myRating.rating, null)}
                                  <div className="text-sm text-gray-500 mt-1">Overall Rating</div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                {[
                                  { label: 'Behavior', value: myRating.behavior_rating },
                                  { label: 'Nature', value: myRating.nature_rating },
                                  { label: 'Work Knowledge', value: myRating.work_knowledge_rating },
                                  { label: 'Work Quality', value: myRating.work_quality_rating },
                                  { label: 'Punctuality', value: myRating.punctuality_rating },
                                ].map(item => item.value > 0 && (
                                  <div key={item.label} className="flex justify-between items-center">
                                    <span className="text-gray-600">{item.label}</span>
                                    {renderStars(item.value, null, 'text-sm')}
                                  </div>
                                ))}
                              </div>

                              {myRating.review_text && (
                                <div>
                                  <h4 className="font-medium mb-2">Review</h4>
                                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{myRating.review_text}</p>
                                </div>
                              )}

                              {myRating.review_photos && myRating.review_photos.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2">Photos</h4>
                                  <div className="flex gap-2 overflow-x-auto pb-2">
                                    {myRating.review_photos.map((url, idx) => (
                                      <img key={idx} src={url} alt="Review" className="h-24 w-24 object-cover rounded-lg border" />
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <form onSubmit={submitRating} className="space-y-6">
                              {/* Overall Rating */}
                              <div className="text-center p-6 bg-blue-50 rounded-xl">
                                <label className="block text-lg font-medium mb-2 text-blue-900">
                                  How would you rate {isProvider ? booking.user?.full_name : 'the service'}?
                                </label>
                                <div className="flex justify-center">
                                  {renderStars(rating, setRating, 'text-4xl')}
                                </div>
                              </div>

                              {/* Detailed Ratings */}
                              <div className="space-y-4">
                                <h3 className="font-medium text-gray-900 border-b pb-2">Detailed Feedback</h3>
                                {[
                                  { key: 'behavior', label: 'Behavior (Politeness, Respect)' },
                                  { key: 'nature', label: 'Nature / Attitude' },
                                  { key: 'work_knowledge', label: 'Work Knowledge' },
                                  { key: 'work_quality', label: 'Work Quality / Experience' },
                                  { key: 'punctuality', label: 'Punctuality' },
                                ].map(({ key, label }) => (
                                  <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <span className="text-gray-700 text-sm">{label}</span>
                                    {renderStars(criteriaRatings[key], (val) => setCriteriaRatings(prev => ({ ...prev, [key]: val })), 'text-xl')}
                                  </div>
                                ))}
                              </div>

                              {/* Review Text */}
                              <div>
                                <label className="block text-sm font-medium mb-2">Write a Review (Optional)</label>
                                <textarea
                                  value={review}
                                  onChange={(e) => setReview(e.target.value)}
                                  rows={4}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Tell us more about your experience..."
                                />
                              </div>

                              {/* Image Upload */}
                              <div>
                                <label className="block text-sm font-medium mb-2">Add Photos (Optional)</label>
                                <div className="flex items-center gap-4">
                                  <label className="cursor-pointer px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>Upload Photos</span>
                                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                                  </label>
                                  {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
                                </div>
                                {reviewImages.length > 0 && (
                                  <div className="flex gap-2 mt-3 overflow-x-auto">
                                    {reviewImages.map((url, idx) => (
                                      <div key={idx} className="relative">
                                        <img src={url} alt="" className="h-20 w-20 object-cover rounded-lg border" />
                                        <button
                                          type="button"
                                          onClick={() => setReviewImages(prev => prev.filter((_, i) => i !== idx))}
                                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <button
                                type="submit"
                                className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                              >
                                Submit Review
                              </button>
                            </form>
                          )}
                        </div>
                      )}

                      {/* Their Rating */}
                      {theirRating && (
                        <div className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-gray-100">
                          <h2 className="text-xl font-bold mb-6 text-gray-800">
                            Review from {theirName}
                          </h2>
                          <div className="space-y-6 opacity-90">
                            <div className="flex items-center gap-4">
                              <div className="text-4xl font-bold text-gray-900">{theirRating.rating.toFixed(1)}</div>
                              <div>
                                {renderStars(theirRating.rating, null)}
                                <div className="text-sm text-gray-500 mt-1">Overall Rating</div>
                              </div>
                            </div>
                            {theirRating.review_text && (
                              <div>
                                <h4 className="font-medium mb-2">Review</h4>
                                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg italic">"{theirRating.review_text}"</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Status */}
            {booking.final_price && (
              <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <h3 className="text-xl font-bold mb-4 text-gray-900 border-b pb-3">Payment Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <span className="text-gray-700 font-medium">Total Amount</span>
                    <span className="font-bold text-2xl text-blue-600">{formatCurrency(booking.final_price)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Payment Status</span>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase shadow-sm ${booking.payment_status === 'paid'
                      ? 'bg-green-100 text-green-800 border-2 border-green-200'
                      : 'bg-yellow-100 text-yellow-800 border-2 border-yellow-200'
                      }`}>
                      {booking.payment_status || 'pending'}
                    </span>
                  </div>
                  {booking.cashback_earned > 0 && (
                    <div className="flex justify-between text-green-600 pt-3 border-t">
                      <span className="font-medium">Cashback Earned</span>
                      <span className="font-bold text-lg">+{formatCurrency(booking.cashback_earned)}</span>
                    </div>
                  )}

                  {/* Payment Button - Show when booking is completed and payment is pending */}
                  {booking.status === 'completed' && booking.payment_status !== 'paid' && (
                    <div className="pt-4 border-t">
                      <button
                        onClick={handlePayment}
                        disabled={paymentProcessing || !razorpayLoaded}
                        className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold rounded-xl hover:from-green-700 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 transform hover:scale-105"
                      >
                        {paymentProcessing ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            Make Payment
                          </>
                        )}
                      </button>
                      {!razorpayLoaded && (
                        <p className="text-xs text-gray-500 mt-3 text-center italic">Loading payment system...</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Chat - Enhanced Interface */}
            <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 flex flex-col h-[500px] sm:h-[600px] hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-xl font-bold mb-4 text-gray-900 border-b pb-3">Chat with Provider</h2>
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                {messagesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-400 py-12">
                    <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="font-medium">No messages yet</p>
                    <p className="text-sm mt-1">Start a conversation with your provider</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMine = msg.sender_id === user.id
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-3 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        {/* Avatar */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm ${isMine
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-300 text-gray-700'
                          }`}>
                          {isMine ? user.full_name?.[0] : booking.provider?.user?.full_name?.[0] || 'P'}
                        </div>

                        {/* Message Bubble */}
                        <div className={`max-w-[70%] flex flex-col ${isMine ? 'items-end' : 'items-start'
                          }`}>
                          <div className={`px-5 py-3 rounded-2xl shadow-sm ${isMine
                            ? 'bg-blue-600 text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                            }`}>
                            <div className="break-words">{msg.message}</div>
                          </div>
                          <div className={`text-xs mt-1.5 px-2 ${isMine ? 'text-blue-600' : 'text-gray-500'
                            }`}>
                            {new Date(msg.created_at).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
              <form onSubmit={sendMessage} className="flex gap-3 mt-auto border-t pt-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-5 py-3 border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all transform hover:scale-110 active:scale-95 shadow-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
