import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate } from '../lib/utils'
import {
  Wallet,
  Gift,
  Award,
  Calendar,
  List,
  MapPin,
  ArrowRight,
  Package,
  LogOut
} from 'lucide-react'
import styles from '../styles/UserDashboard.module.css'

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

  const getStatusClass = (status) => {
    const statusMap = {
      'completed': styles.statusCompleted,
      'pending': styles.statusPending,
      'in_progress': styles.statusInProgress,
      'cancelled': styles.statusCancelled,
      'confirmed': styles.statusPending,
      'assigned': styles.statusInProgress,
    }
    return statusMap[status] || styles.statusPending
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className={styles.emptyStateIcon}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.logo}>Home Solution</h1>
          <div className={styles.headerActions}>
            <Link href="/book-service" className={styles.btnPrimary}>
              <Calendar size={18} />
              Book Service
            </Link>
            <button onClick={handleLogout} className={styles.btnLogout}>
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className={styles.mainContent}>
        {/* Welcome Section */}
        <section className={styles.welcomeSection}>
          <div className={styles.welcomeHeader}>
            <h2 className={styles.welcomeTitle}>
              Welcome back, {profile?.full_name || 'User'}! 👋
            </h2>
            <p className={styles.welcomeSubtitle}>
              Manage your bookings, wallet & services easily
            </p>
          </div>

          {/* Wallet Information - 3 Highlight Cards */}
          <div className={styles.highlightCardsGrid}>
            <Link href="/wallet" className={styles.highlightCard}>
              <div className={`${styles.cardIconWrapper} ${styles.iconWallet}`}>
                <Wallet size={24} color="white" />
              </div>
              <div className={styles.cardLabel}>Wallet Balance</div>
              <div className={styles.cardValue}>
                {formatCurrency(profile?.wallet_balance || 0)}
              </div>
            </Link>

            <div className={styles.highlightCard} style={{ cursor: 'default' }}>
              <div className={`${styles.cardIconWrapper} ${styles.iconGift}`}>
                <Gift size={24} color="white" />
              </div>
              <div className={styles.cardLabel}>Total Cashback</div>
              <div className={styles.cardValueGreen}>
                {formatCurrency(profile?.total_cashback || 0)}
              </div>
            </div>

            <div className={styles.highlightCard} style={{ cursor: 'default' }}>
              <div className={`${styles.cardIconWrapper} ${styles.iconAward}`}>
                <Award size={24} color="white" />
              </div>
              <div className={styles.cardLabel}>Reward Points</div>
              <div className={styles.cardValueGold}>
                {profile?.total_rewards || 0} pts
              </div>
            </div>
          </div>
        </section>

        {/* Quick Navigation */}
        <section className={styles.quickNavSection}>
          <h3 className={styles.sectionTitle}>Quick Actions</h3>
          <div className={styles.quickNavGrid}>
            <Link href="/book-service" className={styles.quickNavCard}>
              <div className={`${styles.quickNavIcon} ${styles.iconBook}`}>
                <Calendar size={28} color="white" />
              </div>
              <span className={styles.quickNavLabel}>Book Service</span>
            </Link>

            <Link href="/bookings" className={styles.quickNavCard}>
              <div className={`${styles.quickNavIcon} ${styles.iconList}`}>
                <List size={28} color="white" />
              </div>
              <span className={styles.quickNavLabel}>All Bookings</span>
            </Link>

            <Link href="/wallet" className={styles.quickNavCard}>
              <div className={`${styles.quickNavIcon} ${styles.iconWalletNav}`}>
                <Wallet size={28} color="white" />
              </div>
              <span className={styles.quickNavLabel}>Wallet</span>
            </Link>

            <Link href="/addresses" className={styles.quickNavCard}>
              <div className={`${styles.quickNavIcon} ${styles.iconMap}`}>
                <MapPin size={28} color="white" />
              </div>
              <span className={styles.quickNavLabel}>Addresses</span>
            </Link>
          </div>
        </section>

        {/* Recent Bookings */}
        <section className={styles.bookingsSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Recent Bookings</h3>
            <Link href="/bookings" className={styles.viewAllLink}>
              View All
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className={styles.bookingsContainer}>
            {bookings.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>
                  <Package size={40} color="white" />
                </div>
                <h4 className={styles.emptyStateTitle}>No bookings yet</h4>
                <p className={styles.emptyStateText}>
                  Start your journey by booking your first service
                </p>
                <Link href="/book-service" className={styles.btnPrimary}>
                  <Calendar size={18} />
                  Book your first service
                </Link>
              </div>
            ) : (
              <div className={styles.bookingsList}>
                {bookings.map(booking => (
                  <div key={booking.id} className={styles.bookingCard}>
                    <div className={styles.bookingIcon}>
                      <Package size={24} color="white" />
                    </div>

                    <div className={styles.bookingDetails}>
                      <h4 className={styles.bookingTitle}>
                        {booking.service?.name || 'Service'}
                      </h4>
                      <div className={styles.bookingMeta}>
                        <div>Booking #: {booking.booking_number}</div>
                        <div>Date: {formatDate(booking.scheduled_date || booking.created_at)}</div>
                        {booking.provider && (
                          <div>
                            Provider: {booking.provider.user?.full_name || booking.provider.business_name || 'Not assigned'}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={styles.bookingActions}>
                      <span className={`${styles.statusChip} ${getStatusClass(booking.status)}`}>
                        {booking.status.replace('_', ' ')}
                      </span>
                      {booking.final_price && (
                        <span className={styles.bookingAmount}>
                          {formatCurrency(booking.final_price)}
                        </span>
                      )}
                      <Link href={`/booking/${booking.id}`} className={styles.btnPill}>
                        View Details
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Mobile Sticky Book Button */}
      <div className={styles.stickyBookButton}>
        <Link href="/book-service" className={styles.btnPrimary}>
          <Calendar size={20} />
          Book Now
        </Link>
      </div>
    </div>
  )
}
