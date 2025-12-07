import Link from 'next/link'
import { useRouter } from 'next/router'
import {
    Wallet,
    Gift,
    Award,
    Calendar,
    List,
    MapPin,
    ArrowRight,
    Package
} from 'lucide-react'
import { formatCurrency, formatDate } from '../../lib/utils'
import styles from '../../styles/UserDashboard.module.css'

export default function DashboardHome({ user, profile, bookings }) {
    const router = useRouter()

    const navigateToView = (view) => {
        router.push(`/dashboard?view=${view}`, undefined, { shallow: true })
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

    return (
        <>
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
                    <button onClick={() => navigateToView('wallet')} className={styles.highlightCard}>
                        <div className={`${styles.cardIconWrapper} ${styles.iconWallet}`}>
                            <Wallet size={24} color="white" />
                        </div>
                        <div className={styles.cardLabel}>Wallet Balance</div>
                        <div className={styles.cardValue}>
                            {formatCurrency(profile?.wallet_balance || 0)}
                        </div>
                    </button>

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
                    <button onClick={() => navigateToView('book-service')} className={styles.quickNavCard}>
                        <div className={`${styles.quickNavIcon} ${styles.iconBook}`}>
                            <Calendar size={28} color="white" />
                        </div>
                        <span className={styles.quickNavLabel}>Book Service</span>
                    </button>

                    <button onClick={() => navigateToView('bookings')} className={styles.quickNavCard}>
                        <div className={`${styles.quickNavIcon} ${styles.iconList}`}>
                            <List size={28} color="white" />
                        </div>
                        <span className={styles.quickNavLabel}>All Bookings</span>
                    </button>

                    <button onClick={() => navigateToView('wallet')} className={styles.quickNavCard}>
                        <div className={`${styles.quickNavIcon} ${styles.iconWalletNav}`}>
                            <Wallet size={28} color="white" />
                        </div>
                        <span className={styles.quickNavLabel}>Wallet</span>
                    </button>

                    <button onClick={() => navigateToView('addresses')} className={styles.quickNavCard}>
                        <div className={`${styles.quickNavIcon} ${styles.iconMap}`}>
                            <MapPin size={28} color="white" />
                        </div>
                        <span className={styles.quickNavLabel}>Addresses</span>
                    </button>
                </div>
            </section>

            {/* Recent Bookings */}
            <section className={styles.bookingsSection}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>Recent Bookings</h3>
                    <button onClick={() => navigateToView('bookings')} className={styles.viewAllLink}>
                        View All
                        <ArrowRight size={16} />
                    </button>
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
                            <button onClick={() => navigateToView('book-service')} className={styles.btnPrimary}>
                                <Calendar size={18} />
                                Book your first service
                            </button>
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
        </>
    )
}
