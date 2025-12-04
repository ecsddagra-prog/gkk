import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import axios from 'axios'
import toast from 'react-hot-toast'
import ProviderLayout from '../../components/provider/ProviderLayout'
import { Calendar, MapPin, User, DollarSign, Clock } from 'lucide-react'
import { Button, Card, Badge, StatusBadge, Modal, ModalFooter, FormInput, FormTextarea, LoadingSkeleton } from '../../components/shared'
import { formatCurrency, formatDate, getStatusLabel, getStatusColor } from '../../lib/utils'
import styles from '../../styles/Bookings.module.css'

function ProviderBookingsContent() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [provider, setProvider] = useState(null)
  const [bookings, setBookings] = useState([])
  const [rateQuotes, setRateQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('bookings')

  // Modal states
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [completionData, setCompletionData] = useState({ amount: '', paymentMethod: 'cash' })

  useEffect(() => {
    // Get user from auth
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
      } else {
        router.push('/login')
      }
    }
    getUser()
  }, [router])

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
          router.push('/provider/register')
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

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSkeleton variant="rect" width="100%" height="400px" />
      </div>
    )
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

  return (
    <div className={styles.bookingsContainer}>
      <div className={styles.contentContainer}>
        {/* Tabs */}
        <div className={styles.tabsContainer}>
          <div className={styles.tabsList}>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`${styles.tabButton} ${activeTab === 'bookings' ? styles.active : ''}`}
            >
              <div className={styles.tabContent}>
                <span>My Bookings</span>
                <span className={styles.tabCount}>{bookings.length}</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('rate_quotes')}
              className={`${styles.tabButton} ${activeTab === 'rate_quotes' ? styles.active : ''}`}
            >
              <div className={styles.tabContent}>
                <span>Rate Quote Requests</span>
                <span className={styles.tabCount}>
                  {rateQuotes.filter(rq => rq.status === 'open').length}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Filters - Only for bookings tab */}
        {activeTab === 'bookings' && (
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
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {activeTab === 'bookings' ? (
          bookings.length === 0 ? (
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
              {bookings.map(booking => (
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
              ))}
            </div>
          )
        ) : (
          /* Rate Quotes Tab */
          <div className={styles.bookingsList}>
            {rateQuotes.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>💰</div>
                <h3 className={styles.emptyTitle}>No rate quote requests</h3>
                <p className={styles.emptyText}>
                  Rate quote requests will appear here when users request quotes for your services
                </p>
              </div>
            ) : (
              rateQuotes.map(rq => {
                const timeRemaining = new Date(rq.expires_at) - Date.now()
                const minutesLeft = Math.floor(timeRemaining / 60000)
                const isExpired = timeRemaining <= 0

                return (
                  <Card key={rq.id} className={styles.bookingCard}>
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
                        </div>

                        {rq.my_quote && (
                          <div className={styles.quoteBox}>
                            <div className={styles.quoteLabel}>Your Quote</div>
                            <div className={styles.quoteAmount}>₹{rq.my_quote.quoted_price}</div>
                          </div>
                        )}
                      </div>

                      <div className={styles.bookingActions}>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => router.push(`/rate-quote/${rq.id}`)}
                        >
                          {rq.has_responded ? '📝 View & Update' : '💰 Submit Quote'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })
            )}
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
    </div>
  )
}

// Wrap with ProviderLayout to maintain sidebar
export default function ProviderBookings() {
  return (
    <ProviderLayout activeModule="bookings">
      <ProviderBookingsContent />
    </ProviderLayout>
  )
}
