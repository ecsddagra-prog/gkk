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
      const { data } = await supabase
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

      setBooking(data)

      // Handle ratings
      if (data?.ratings) {
        // ratings is an array now
        const ratings = Array.isArray(data.ratings) ? data.ratings : [data.ratings]
        const uRating = ratings.find(r => r.rated_by === 'user' || !r.rated_by) // Handle legacy ratings as user
        const pRating = ratings.find(r => r.rated_by === 'provider')

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
        }
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
        work_quality: criteriaRatings.work_quality,
        punctuality: criteriaRatings.punctuality,
        rated_by: booking.provider?.user_id === user.id ? 'provider' : 'user'
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2">
              ← Back
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Booking #{booking.booking_number}</h1>
            <div className={`px-3 py-1 rounded-full text-sm font-medium bg-${getStatusColor(booking.status)}-100 text-${getStatusColor(booking.status)}-800 capitalize`}>
              {getStatusLabel(booking.status)}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Status Timeline (Simplified) */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Booking Status</h2>
              <div className="flex items-center justify-between text-sm">
                {['pending', 'confirmed', 'in_progress', 'completed'].map((step, index) => {
                  const steps = ['pending', 'confirmed', 'in_progress', 'completed']
                  const currentIdx = steps.indexOf(booking.status)
                  const stepIdx = steps.indexOf(step)
                  const isActive = stepIdx <= currentIdx

                  return (
                    <div key={step} className="flex flex-col items-center flex-1 relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 z-10 ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                        }`}>
                        {isActive ? '✓' : index + 1}
                      </div>
                      <span className={`capitalize ${isActive ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                        {getStatusLabel(step)}
                      </span>
                      {index < steps.length - 1 && (
                        <div className={`absolute top-4 left-1/2 w-full h-0.5 -z-0 ${stepIdx < currentIdx ? 'bg-blue-600' : 'bg-gray-200'
                          }`} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Booking Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Service Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Service</label>
                  <div className="font-medium">{booking.service?.name}</div>
                </div>
                {booking.sub_service_name && (
                  <div>
                    <label className="text-sm text-gray-500">Sub-Service</label>
                    <div className="font-medium">{booking.sub_service_name}</div>
                  </div>
                )}
                <div>
                  <label className="text-sm text-gray-500">Date & Time</label>
                  <div className="font-medium">{formatDateTime(booking.scheduled_date)}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Address</label>
                  <div className="font-medium">{booking.service_address}</div>
                </div>
                {booking.provider && (
                  <div className="md:col-span-2 pt-4 border-t mt-2">
                    <label className="text-sm text-gray-500">Provider</label>
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
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Quotes</h2>
                <div className="space-y-3">
                  {booking.quotes.map(quote => (
                    <div key={quote.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-700">{quote.quoted_by === 'user' ? 'Your Quote' : 'Provider Quote'}</div>
                          <div className="text-2xl font-bold text-blue-600">{formatCurrency(quote.quoted_price)}</div>
                          {quote.message && <div className="text-sm text-gray-600 mt-1">{quote.message}</div>}
                        </div>
                        {quote.quoted_by === 'provider' && !quote.is_accepted && booking.status === 'quote_sent' && (
                          <button
                            onClick={() => acceptQuote(quote.id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                      <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-bold mb-6">
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
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-bold mb-3 text-gray-900">Payment Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="font-semibold text-lg">{formatCurrency(booking.final_price)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${booking.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {booking.payment_status || 'pending'}
                    </span>
                  </div>
                  {booking.cashback_earned > 0 && (
                    <div className="flex justify-between text-green-600 pt-2 border-t">
                      <span>Cashback Earned</span>
                      <span className="font-semibold">+{formatCurrency(booking.cashback_earned)}</span>
                    </div>
                  )}

                  {/* Payment Button - Show when booking is completed and payment is pending */}
                  {booking.status === 'completed' && booking.payment_status !== 'paid' && (
                    <div className="pt-3 border-t">
                      <button
                        onClick={handlePayment}
                        disabled={paymentProcessing || !razorpayLoaded}
                        className="w-full px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
                      >
                        {paymentProcessing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            Make Payment
                          </>
                        )}
                      </button>
                      {!razorpayLoaded && (
                        <p className="text-xs text-gray-500 mt-2 text-center">Loading payment system...</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Chat */}
            <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col h-[500px]">
              <h2 className="font-bold mb-4 text-gray-900">Chat with Provider</h2>
              <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-400 text-sm py-8">No messages yet</div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${msg.sender_id === user.id
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                        }`}>
                        <div>{msg.message}</div>
                        <div className={`text-[10px] mt-1 text-right ${msg.sender_id === user.id ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                          {formatDateTime(msg.created_at)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={sendMessage} className="flex gap-2 mt-auto">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
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
