import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import axios from 'axios'
import toast from 'react-hot-toast'
import { TrendingUp, DollarSign, CheckCircle, XCircle, Calendar, User, Star } from 'lucide-react'
import { Card, LoadingSkeleton } from '../shared'
import StatCard from './StatCard'
import PerformanceChart from './PerformanceChart'
import { formatCurrency, formatDate } from '../../lib/utils'
import styles from '../../styles/ProviderHome.module.css'

export default function ProviderHome({ user }) {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState(null)
    const [provider, setProvider] = useState(null)
    const [recentBookings, setRecentBookings] = useState([])
    const [recentReviews, setRecentReviews] = useState([])
    const [chartPeriod, setChartPeriod] = useState('7days')

    useEffect(() => {
        if (user) {
            loadDashboardData()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    const loadDashboardData = async () => {
        try {
            const { data: providerData } = await supabase
                .from('providers')
                .select('*, user:users(*)')
                .eq('user_id', user.id)
                .single()

            setProvider(providerData)

            const token = (await supabase.auth.getSession()).data.session?.access_token
            const { data } = await axios.get('/api/provider/stats', {
                headers: { Authorization: `Bearer ${token}` }
            })

            setStats(data.stats)
            setRecentBookings(data.recentTransactions?.slice(0, 5) || [])
            setRecentReviews(data.recentReviews?.slice(0, 5) || [])
        } catch (error) {
            console.error('Error loading dashboard data:', error)
            toast.error('Failed to load dashboard data')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <LoadingSkeleton variant="rect" width="100%" height="400px" />
            </div>
        )
    }

    return (
        <div className={styles.dashboardContainer}>
            {/* Performance Overview Cards */}
            <section className={styles.statsSection}>
                <div className={styles.statsGrid}>
                    <StatCard
                        IconComponent={DollarSign}
                        label="Total Earnings"
                        value={formatCurrency(stats?.totalEarnings || 0)}
                        accentColor="green"
                        trend="+12%"
                    />
                    <StatCard
                        IconComponent={TrendingUp}
                        label="Pending Clearance"
                        value={formatCurrency(stats?.pendingEarnings || 0)}
                        accentColor="yellow"
                    />
                    <StatCard
                        IconComponent={CheckCircle}
                        label="Completed Orders"
                        value={stats?.orderCounts?.completed || 0}
                        accentColor="blue"
                        trend="↑"
                    />
                    <StatCard
                        IconComponent={XCircle}
                        label="Cancelled Orders"
                        value={stats?.orderCounts?.cancelled || 0}
                        accentColor="red"
                    />
                </div>
            </section>

            {/* Performance Insights */}
            <section className={styles.insightsSection}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>📈 Performance Insights</h2>
                    <div className={styles.periodToggle}>
                        <button
                            className={chartPeriod === '7days' ? styles.active : ''}
                            onClick={() => setChartPeriod('7days')}
                        >
                            7 Days
                        </button>
                        <button
                            className={chartPeriod === '30days' ? styles.active : ''}
                            onClick={() => setChartPeriod('30days')}
                        >
                            30 Days
                        </button>
                    </div>
                </div>
                <div className={styles.chartContainer}>
                    <PerformanceChart period={chartPeriod} stats={stats} />
                </div>
            </section>

            {/* Recent Activity */}
            <section className={styles.activitySection}>
                <div className={styles.activityGrid}>
                    {/* Recent Bookings */}
                    <Card className={styles.activityCard}>
                        <h3 className={styles.activityTitle}>
                            <Calendar size={20} />
                            Recent Bookings
                        </h3>
                        {recentBookings.length > 0 ? (
                            <div className={styles.bookingsList}>
                                {recentBookings.map((booking) => (
                                    <div key={booking.id} className={styles.bookingItem}>
                                        <div className={styles.bookingHeader}>
                                            <div className={styles.bookingService}>{booking.service_name}</div>
                                            <div className={styles.bookingStatus}>
                                                <span className={`badge badge-${booking.status}`}>
                                                    {booking.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={styles.bookingDetails}>
                                            <div className={styles.bookingDetail}>
                                                <Calendar size={14} />
                                                {formatDate(booking.created_at)}
                                            </div>
                                            <div className={styles.bookingDetail}>
                                                <User size={14} />
                                                {booking.customer_name}
                                            </div>
                                            <div className={styles.bookingDetail}>
                                                <DollarSign size={14} />
                                                {formatCurrency(booking.final_price || 0)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>📋</div>
                                <p className={styles.emptyText}>No recent bookings</p>
                            </div>
                        )}
                    </Card>

                    {/* Recent Reviews */}
                    <Card className={styles.activityCard}>
                        <h3 className={styles.activityTitle}>
                            <Star size={20} />
                            Recent Reviews
                        </h3>
                        {recentReviews.length > 0 ? (
                            <div className={styles.reviewsList}>
                                {recentReviews.map((review) => (
                                    <div key={review.id} className={styles.reviewItem}>
                                        <div className={styles.reviewHeader}>
                                            <span className={styles.reviewerName}>{review.customer_name}</span>
                                            <span className={styles.reviewStars}>
                                                {'⭐'.repeat(review.rating)}
                                            </span>
                                        </div>
                                        <p className={styles.reviewText}>{review.review_text}</p>
                                        <div className={styles.reviewDate}>
                                            {formatDate(review.created_at)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>⭐</div>
                                <p className={styles.emptyText}>No reviews yet</p>
                            </div>
                        )}
                    </Card>
                </div>
            </section>
        </div>
    )
}
