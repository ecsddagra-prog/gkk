import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Calendar, MapPin, User, DollarSign, Clock } from 'lucide-react'
import { Button, Card, Badge, StatusBadge, Modal, ModalFooter, FormInput, FormTextarea, LoadingSkeleton } from '../shared'
import { formatCurrency, formatDate, getStatusLabel, getStatusColor } from '../../lib/utils'
import styles from '../../styles/Bookings.module.css'
import LocationPicker from '../ui/LocationPicker'

export default function ProviderBookings() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [provider, setProvider] = useState(null)
  const [bookings, setBookings] = useState([])
  const [rateQuotes, setRateQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  // Modal states
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [completionData, setCompletionData] = useState({ amount: '', paymentMethod: 'cash' })

  // Map View State
  const [showMapModal, setShowMapModal] = useState(false)
  const [viewingLocation, setViewingLocation] = useState(null)

  useEffect(() => {
    // Get user from auth
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
      }
    }
    getUser()
  }, [])

  useEffect(() => {
    if (!user) return
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filter])

  useEffect(() => {
    if (!provider) return

    // Subscribe to booking updates
    const assignedSubscription = supabase
      .channel(`provider-bookings-${provider.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: `provider_id=eq.${provider.id}`
      }, () => loadData())
      .subscribe()

    const unassignedSubscription = supabase
      .channel(`provider-bookings-unassigned`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: 'provider_id=is.null'
      }, () => loadData())
      .subscribe()

    return () => {
      supabase.removeChannel(assignedSubscription)
      supabase.removeChannel(unassignedSubscription)
    }
  }, [provider])

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!provider) {
        const { data: providerData } = await supabase
          .from('providers')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (providerData) {
          setProvider(providerData)
        } else {
          // If no provider profile, they shouldn't be here, but we'll handle gracefully
          return
        }
      }

      const bookingsResponse = await axios.get('/api/provider/bookings/list', {
        headers: { Authorization: `Bearer ${session?.access_token}` },
        params: { status: filter }
      })
      setBookings(bookingsResponse.data.bookings || [])

      const rateQuotesResponse = await axios.get('/api/provider/rate-quotes/list', {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      })
      setRateQuotes(rateQuotesResponse.data.rate_quotes || [])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (bookingId, newStatus, finalPrice = null, paymentMethod = null) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const payload = { status: newStatus, changed_by: user.id }
      if (finalPrice) payload.final_price = finalPrice
      if (paymentMethod) payload.payment_method = paymentMethod

      await axios.patch(`/api/bookings/${bookingId}/status`, payload, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      })
      toast.success(`Booking marked as ${getStatusLabel(newStatus)}`)
      loadData()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const handleCompleteSubmit = async (e) => {
    e.preventDefault()
    if (!completionData.amount || isNaN(completionData.amount) || parseFloat(completionData.amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    await updateStatus(
      selectedBooking.id,
      'completed',
      parseFloat(completionData.amount),
      completionData.paymentMethod
    )
    setShowCompleteModal(false)
    setSelectedBooking(null)
  }

  const handleCancelBooking = async (e) => {
    e.preventDefault()
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason')
      return
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      await axios.post('/api/provider/bookings/release', {
        booking_id: selectedBooking.id,
        reason: cancelReason
      }, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      })

      toast.success('Booking cancelled')
      setShowCancelModal(false)
      setCancelReason('')
      setSelectedBooking(null)
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to cancel')
    }
  }

  const handleQuoteAccept = async (booking) => {
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
  }

  const handleAcceptBroadcast = async (rq) => {
    if (!confirm(`Accept this job for ₹${rq.requested_price}? This will confirm the booking immediately.`)) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      await axios.post('/api/provider/rate-quotes/accept', {
        rate_quote_id: rq.id
      }, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      })
      toast.success('Job accepted successfully!')
      loadData()
    } catch (error) {
      console.error('Accept error:', error)
      toast.error(error.response?.data?.error || 'Failed to accept job')
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSkeleton variant="rect" width="100%" height="400px" />
      </div>
    )
  }

  /* Counts Calculation */
  const counts = {
    all: bookings.length + rateQuotes.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    quote_requested: bookings.filter(b => b.status === 'quote_requested').length + rateQuotes.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    on_way: bookings.filter(b => b.status === 'on_way').length,
    in_progress: bookings.filter(b => b.status === 'in_progress').length,
    completed: bookings.filter(b => b.status === 'completed').length
  }

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'quote_requested', label: 'Quote Requested' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'on_way', label: 'On the Way' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' }
  ]

  const getDisplayItems = () => {
    let items = [...bookings]
    if (filter === 'quote_requested') {
      return [...bookings.filter(b => b.status === 'quote_requested'), ...rateQuotes.map(rq => ({ ...rq, isRateQuote: true }))]
    }
    // For 'All', we should probably show rate quotes too? Or keep them separate?
    // User asked for "Total" tab to show numbers. Usually 'All' includes everything.
    if (filter === 'all') {
      return [...items, ...rateQuotes.map(rq => ({ ...rq, isRateQuote: true }))]
    }
    return items.filter(b => b.status === filter)
  }

  const displayItems = getDisplayItems()

  return (
    <div className={styles.bookingsContainer}>
      <div className={styles.contentContainer}>
        {/* Filters */}
        <div className={styles.filtersContainer}>
          <div className={styles.filtersScrollWrapper}>
            <div className={styles.filtersList}>
              {filterOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`${styles.filterChip} ${filter === option.value ? styles.active : ''}`}
                >
                  {option.label}
                  <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${filter === option.value ? 'bg-white text-purple-600' : 'bg-gray-200 text-gray-600'}`}>
                    {counts[option.value] || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        {displayItems.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            <h3 className={styles.emptyTitle}>No bookings found</h3>
            <p className={styles.emptyText}>
              {filter === 'all'
                ? 'You don\'t have any bookings yet'
                : `No ${filterOptions.find(f => f.value === filter)?.label.toLowerCase()} bookings`
              }
            </p>
          </div>
        ) : (
          <div className={styles.bookingsList}>
            {displayItems.map(item => {
              if (item.isRateQuote) {
                const rq = item
                const timeRemaining = new Date(rq.expires_at) - Date.now()
                const minutesLeft = Math.floor(timeRemaining / 60000)
                const isExpired = timeRemaining <= 0

                return (
                  <Card key={`rq-${rq.id}`} className={styles.bookingCard}>
                    <div className={styles.bookingCardContent}>
                      <div className={styles.bookingInfo}>
                        <div className={styles.bookingHeader}>
                          <h3 className={styles.serviceName}>{rq.service?.name}</h3>
                          <Badge variant={rq.status === 'converted' ? 'success' : isExpired ? 'error' : 'warning'}>
                            {rq.status === 'converted' ? '✅ Won' : isExpired ? '⏱ Expired' : '🔥 Active'}
                          </Badge>
                          {rq.has_responded && <Badge variant="info">✓ Responded</Badge>}
                        </div>

                        <div className={styles.bookingDetails}>
                          <div className={styles.detailItem}>
                            <User size={16} className="text-gray-400" />
                            <span className={styles.detailValue}>{rq.user?.full_name}</span>
                          </div>
                          {rq.requested_price && (
                            <div className={styles.detailItem}>
                              <DollarSign size={16} className="text-blue-600" />
                              <span className={styles.detailValue}>Budget: ₹{rq.requested_price}</span>
                            </div>
                          )}
                          <div className={styles.detailItem}>
                            <Clock size={16} className={isExpired ? "text-red-600" : "text-orange-600"} />
                            <span className={styles.detailValue}>
                              {isExpired ? '⏱ Expired' : `⏱ ${minutesLeft} min remaining`}
                            </span>
                          </div>
                          {rq.details?.waiting_time_flexibility && (
                            <div className={styles.detailItem}>
                              <Badge variant="warning">{rq.details.waiting_time_flexibility}</Badge>
                            </div>
                          )}
                        </div>

                        {rq.my_quote && (
                          <div className={styles.quoteBox}>
                            <div className={styles.quoteLabel}>Your Quote</div>
                            <div className={styles.quoteAmount}>₹{rq.my_quote.quoted_price}</div>
                          </div>
                        )}
                      </div>

                      <div className="mt-auto pt-4 flex gap-2">
                        {rq.requested_price ? (
                          <Button
                            variant="primary" // Changed to primary/green for accept
                            className="w-full bg-green-600 hover:bg-green-700 text-white border-none"
                            onClick={() => handleAcceptBroadcast(rq)}
                          >
                            ✅ Accept Offer (₹{rq.requested_price})
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            className="w-full"
                            onClick={() => router.push(`/rate-quote/${rq.id}`)}
                          >
                            {rq.has_responded ? '📝 View & Update' : '💰 Submit Quote'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              }

              const booking = item
              return (
                <Card key={booking.id} className={styles.bookingCard}>
                  <div className={styles.bookingCardContent}>
                    <div className={styles.bookingInfo}>
                      <div className={styles.bookingHeader}>
                        <h3 className={styles.serviceName}>{booking.service?.name}</h3>
                        <StatusBadge status={booking.status} />
                      </div>

                      <div className={styles.bookingDetails}>
                        <div className={styles.detailItem}>
                          <User size={16} className="text-gray-400" />
                          <span className={styles.detailValue}>{booking.user?.full_name}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <Calendar size={16} className="text-gray-400" />
                          <span className={styles.detailValue}>
                            {formatDate(booking.scheduled_date || booking.created_at)}
                          </span>
                        </div>
                        <div className={styles.detailItem}>
                          <MapPin size={16} className="text-gray-400" />
                          <span className={styles.detailValue}>{booking.service_address?.substring(0, 40)}...</span>
                          {booking.service_lat && booking.service_lng && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setViewingLocation({
                                  lat: booking.service_lat,
                                  lng: booking.service_lng,
                                  address: booking.service_address
                                })
                                setShowMapModal(true)
                              }}
                              className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded border border-blue-200 hover:bg-blue-200 transition-colors"
                            >
                              View on Map
                            </button>
                          )}
                        </div>
                        <div className={styles.detailItem}>
                          <DollarSign size={16} className="text-emerald-600" />
                          <span className={styles.amountHighlight}>
                            {formatCurrency(booking.final_price || booking.base_charge || 0)}
                          </span>
                        </div>
                      </div>

                      {/* Quote Box for quote_requested status */}
                      {booking.status === 'quote_requested' && booking.user_quoted_price && (
                        <div className={styles.quoteBox}>
                          <div className={styles.quoteLabel}>
                            {!booking.provider_id && '🎯 Available - '}User's Quote
                          </div>
                          <div className={styles.quoteAmount}>₹{booking.user_quoted_price}</div>
                          {booking.service?.base_price && (
                            <div className={styles.quoteBasePrice}>Base Rate: ₹{booking.service.base_price}</div>
                          )}
                          {!booking.provider_id && (
                            <div className={styles.quoteAvailable}>
                              ✨ First to accept gets the booking!
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className={styles.bookingActions}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => router.push(`/booking/${booking.id}`)}
                      >
                        View Details
                      </Button>

                      {booking.status === 'pending' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => updateStatus(booking.id, 'confirmed')}
                        >
                          Accept
                        </Button>
                      )}

                      {booking.status === 'quote_requested' && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleQuoteAccept(booking)}
                          >
                            ✅ Accept Quote
                          </Button>
                        </>
                      )}

                      {booking.status === 'confirmed' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => updateStatus(booking.id, 'on_way')}
                        >
                          On the Way
                        </Button>
                      )}

                      {booking.status === 'on_way' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => updateStatus(booking.id, 'in_progress')}
                        >
                          Start Work
                        </Button>
                      )}

                      {booking.status === 'in_progress' && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setSelectedBooking(booking)
                              setCompletionData({
                                amount: booking.final_price || booking.user_quoted_price || booking.base_charge || '',
                                paymentMethod: 'cash'
                              })
                              setShowCompleteModal(true)
                            }}
                          >
                            Complete
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              setSelectedBooking(booking)
                              setShowCancelModal(true)
                            }}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Complete Modal */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => {
          setShowCompleteModal(false)
          setSelectedBooking(null)
        }}
        title="Complete Job"
        size="sm"
      >
        <form onSubmit={handleCompleteSubmit}>
          <FormInput
            label="Final Amount to Collect"
            type="number"
            value={completionData.amount}
            onChange={(e) => setCompletionData({ ...completionData, amount: e.target.value })}
            required
            min="1"
            placeholder="0.00"
          />

          <div style={{ marginTop: 'var(--space-4)' }}>
            <label style={{
              display: 'block',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              marginBottom: 'var(--space-2)'
            }}>
              Payment Method
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-2)' }}>
              {['cash', 'online', 'upi'].map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setCompletionData({ ...completionData, paymentMethod: method })}
                  className="btn"
                  style={{
                    padding: 'var(--space-3)',
                    fontSize: 'var(--font-size-sm)',
                    textTransform: 'capitalize',
                    background: completionData.paymentMethod === method ? 'var(--color-emerald-50)' : 'transparent',
                    border: completionData.paymentMethod === method ? '2px solid var(--color-emerald-500)' : '1px solid var(--color-border)',
                    color: completionData.paymentMethod === method ? 'var(--color-emerald-700)' : 'var(--color-text-secondary)'
                  }}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <ModalFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowCompleteModal(false)
                setSelectedBooking(null)
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Complete & Collect
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false)
          setCancelReason('')
        }}
        title="Cancel Booking"
        size="sm"
      >
        <p style={{ marginBottom: 'var(--space-6)', color: 'var(--color-text-secondary)' }}>
          Are you sure you want to cancel this booking? It will be released back to the pool for other providers.
        </p>
        <form onSubmit={handleCancelBooking}>
          <FormTextarea
            label="Reason for Cancellation"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            required
            placeholder="e.g. Too far, Emergency, etc."
            rows={3}
          />

          <ModalFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowCancelModal(false)
                setCancelReason('')
              }}
            >
              Keep Booking
            </Button>
            <Button type="submit" variant="danger">
              Confirm Cancel
            </Button>
          </ModalFooter>
        </form>
      </Modal>


      {/* Map View Modal */}
      {
        showMapModal && viewingLocation && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-lg p-0 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col relative shadow-2xl">
              <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                <div className="flex items-center gap-2">
                  <MapPin className="text-blue-600" size={20} />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Booking Location</h3>
                    <p className="text-xs text-gray-500 max-w-md truncate">{viewingLocation.address}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMapModal(false)}
                  className="bg-gray-200 hover:bg-gray-300 rounded-full p-2 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-0 flex-1 relative bg-gray-100 min-h-[400px]">
                <LocationPicker
                  value={viewingLocation}
                  center={[viewingLocation.lat, viewingLocation.lng]}
                  zoom={16}
                  readOnly={true}
                />
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${viewingLocation.lat},${viewingLocation.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[500] bg-white text-blue-600 px-6 py-2 rounded-full font-medium shadow-lg hover:bg-blue-50 flex items-center gap-2 border border-blue-100"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Navigate (Google Maps)
                </a>
              </div>
            </div>
          </div>
        )
      }
    </div >
  )
}
