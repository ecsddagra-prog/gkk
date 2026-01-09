import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { MapPin, Calendar, Clock, ChevronLeft, MessageSquare, CreditCard, Star, CheckCircle2, AlertCircle, User, Hash, Zap, ArrowRight } from 'lucide-react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { formatCurrency, formatDateTime, getStatusLabel, getStatusColor, formatDate } from '../../lib/utils'

// Status Badge Component with proper color mapping
// Status Badge Component with premium styling
const StatusBadge = ({ status }) => {
  const statusStyles = {
    pending: 'bg-orange-100 text-orange-600 border-orange-200',
    confirmed: 'bg-blue-100 text-blue-600 border-blue-200',
    in_progress: 'bg-purple-100 text-purple-600 border-purple-200',
    completed: 'bg-green-100 text-green-600 border-green-200',
    cancelled: 'bg-red-100 text-red-600 border-red-200'
  }

  const style = statusStyles[status] || 'bg-gray-100 text-gray-600 border-gray-200'

  return (
    <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${style} shadow-sm`}>
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
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col">
      <Header user={user} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <Link href="/bookings" className="inline-flex items-center gap-2 text-purple-600 font-black text-xs uppercase tracking-widest mb-4 hover:translate-x-[-4px] transition-transform">
              <ChevronLeft className="w-4 h-4" /> Back to Bookings
            </Link>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-tight mb-2">
              Booking <span className="text-purple-600">Details</span>
            </h1>
            <div className="flex items-center gap-4">
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] flex items-center gap-1">
                <Hash className="w-3 h-3" /> {booking.booking_number}
              </p>
              <div className="h-4 w-px bg-gray-200"></div>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {formatDate(booking.created_at)}
              </p>
            </div>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Main Service Card */}
            <div className="glass-premium bg-white/70 rounded-[40px] p-10 border border-white shadow-xl">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-24 h-24 bg-purple-100 rounded-3xl flex items-center justify-center text-5xl shadow-inner shrink-0">
                  {booking.service?.category?.icon || '🛠️'}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase mb-2">{booking.service?.name}</h2>
                  <p className="text-gray-500 font-bold mb-6 italic">"{booking.service?.description?.substring(0, 100)}..."</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-purple-600">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Scheduled Date</p>
                        <p className="text-sm font-black text-gray-700">{formatDateTime(booking.scheduled_date)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-purple-600">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Service Address</p>
                        <p className="text-sm font-black text-gray-700 line-clamp-1">{booking.service_address}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="glass-premium bg-white/70 rounded-[40px] p-10 border border-white shadow-xl">
              <h3 className="text-xl font-black text-gray-900 tracking-tighter uppercase mb-10 italic">Work Progression</h3>
              <div className="flex justify-between relative">
                <div className="absolute top-6 left-0 w-full h-1 bg-gray-100 -z-0 rounded-full"></div>
                {['pending', 'confirmed', 'in_progress', 'completed'].map((step, idx) => {
                  const statusOrder = ['pending', 'confirmed', 'in_progress', 'completed']
                  const currentIdx = statusOrder.indexOf(booking.status)
                  const isActive = idx <= currentIdx
                  const isCurrent = idx === currentIdx

                  return (
                    <div key={step} className="flex flex-col items-center z-10 basis-1/4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 ${isCurrent ? 'bg-purple-600 text-white shadow-xl shadow-purple-200 scale-110' :
                        isActive ? 'bg-gray-900 text-white shadow-lg' : 'bg-white text-gray-300 border border-gray-100'
                        }`}>
                        {isActive ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-gray-900' : 'text-gray-300'
                        }`}>
                        {getStatusLabel(step)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Provider Section */}
            {booking.provider && (
              <div className="glass-premium bg-white/70 rounded-[40px] p-10 border border-white shadow-xl">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-gray-900 tracking-tighter uppercase italic">Assigned Professional</h3>
                  <div className="flex items-center gap-1 bg-yellow-400 text-white px-3 py-1 rounded-full text-[10px] font-black">
                    <Star className="w-3 h-3 fill-current" /> 4.9
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-3xl overflow-hidden border-4 border-white shadow-lg">
                    {booking.provider.user?.image_url ? (
                      <img src={booking.provider.user.image_url} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-purple-100 flex items-center justify-center text-purple-600 text-3xl font-black uppercase">
                        {booking.provider.user?.full_name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-gray-900 uppercase tracking-tight">{booking.provider.user?.full_name || booking.provider.business_name}</h4>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-4">Verified Professional</p>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">View Profile</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Ratings Section */}
            {booking.status === 'completed' && (
              <div className="glass-premium bg-white/70 rounded-[40px] p-10 border border-white shadow-xl">
                <h3 className="text-xl font-black text-gray-900 tracking-tighter uppercase mb-10 italic">Your Feedback</h3>
                {userRating ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="text-5xl font-black text-gray-900 tracking-tighter">{userRating.rating}</div>
                      <div>
                        {renderStars(userRating.rating, null, 'text-xl')}
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Overall Satisfaction</p>
                      </div>
                    </div>
                    {userRating.review_text && (
                      <div className="bg-gray-50/50 p-6 rounded-[24px] border border-gray-100 italic text-gray-600 font-medium">
                        "{userRating.review_text}"
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={submitRating} className="space-y-8">
                    <div className="bg-gray-50/50 p-10 rounded-[32px] text-center border border-gray-100">
                      <p className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">How was your experience?</p>
                      <div className="flex justify-center mb-2">
                        {renderStars(rating, setRating, 'text-5xl')}
                      </div>
                    </div>
                    <textarea
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      placeholder="Share your thoughts about the service..."
                      className="w-full bg-white border border-gray-100 p-8 rounded-[32px] focus:ring-4 focus:ring-purple-100 outline-none font-bold text-gray-700 transition-all min-h-[160px]"
                    />
                    <button type="submit" className="w-full py-5 bg-gray-900 text-white rounded-[24px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200">
                      Submit Review
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          <div className="space-y-8">
            {/* Payment Summary */}
            <div className="glass-premium bg-gray-900 text-white rounded-[40px] p-10 border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <CreditCard className="w-24 h-24" />
              </div>
              <h3 className="text-xl font-black tracking-tighter uppercase mb-8 italic relative z-10">Bill Details</h3>
              <div className="space-y-4 mb-8 relative z-10">
                <div className="flex justify-between text-gray-400 text-xs font-bold uppercase tracking-widest">
                  <span>Base Charge</span>
                  <span>{formatCurrency(booking.base_charge)}</span>
                </div>
                {booking.final_price && (
                  <div className="flex justify-between text-2xl font-black pt-4 border-t border-white/10 tracking-tighter">
                    <span>Total</span>
                    <span className="text-purple-400">{formatCurrency(booking.final_price)}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <span className="text-[10px] font-black uppercase tracking-widest">Payment Status</span>
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${booking.payment_status === 'paid' ? 'bg-green-400/20 text-green-400' : 'bg-orange-400/20 text-orange-400'
                  }`}>
                  {booking.payment_status || 'Pending'}
                </span>
              </div>

              {booking.status === 'completed' && booking.payment_status !== 'paid' && (
                <button
                  onClick={handlePayment}
                  disabled={paymentProcessing}
                  className="w-full mt-8 py-5 bg-purple-600 hover:bg-purple-700 text-white rounded-[24px] font-black text-lg transition-all shadow-xl shadow-purple-900 flex items-center justify-center gap-3 active:scale-95"
                >
                  {paymentProcessing ? 'Processing...' : <>Pay Now <ArrowRight className="w-5 h-5" /></>}
                </button>
              )}
            </div>

            {/* Chat Interface */}
            <div className="glass-premium bg-white/70 rounded-[40px] p-8 border border-white shadow-xl flex flex-col h-[640px]">
              <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6 shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter leading-none mb-1">Live Chat</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Typical response <span className="text-green-500">5 mins</span></p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 scrollbar-hide">
                {messagesLoading ? (
                  <div className="flex justify-center py-10 opacity-20"><div className="animate-spin w-8 h-8 border-2 border-purple-600 rounded-full border-t-transparent"></div></div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-20 opacity-20">
                    <p className="text-sm font-black uppercase tracking-widest">No messages yet</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-4 rounded-[20px] font-bold text-sm ${msg.sender_id === user.id ? 'bg-gray-900 text-white rounded-br-none' : 'bg-purple-100 text-purple-900 rounded-bl-none'
                        }`}>
                        {msg.message}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={sendMessage} className="relative shrink-0">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type to chat..."
                  className="w-full bg-gray-100/50 p-5 pr-16 rounded-[24px] focus:ring-4 focus:ring-purple-100 outline-none font-bold text-gray-700 transition-all placeholder:text-gray-400"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center hover:bg-black transition-all">
                  <Zap className="w-5 h-5 fill-current" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
