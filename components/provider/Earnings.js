import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import axios from 'axios'
import toast from 'react-hot-toast'
import { DollarSign, TrendingUp, CheckCircle, XCircle, Star, Calendar } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardBody, LoadingSkeleton } from '../shared'
import StatCard from './StatCard'
import { formatCurrency, formatDate } from '../../lib/utils'
import styles from '../../styles/Earnings.module.css'

export default function Earnings({ user }) {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState(null)
    const [transactions, setTransactions] = useState([])
    const [reviews, setReviews] = useState([])

    useEffect(() => {
        if (user) {
            loadStats()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    const loadStats = async () => {
        try {
            const token = (await supabase.auth.getSession()).data.session?.access_token
            const { data } = await axios.get('/api/provider/stats', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setStats(data.stats)
            setTransactions(data.recentTransactions || [])
            setReviews(data.recentReviews || [])
        } catch (error) {
            console.error('Error loading stats:', error)
            toast.error('Failed to load earnings data')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className={styles.container}>
                <LoadingSkeleton variant="rect" width="100%" height="400px" />
            </div>
        )
    }

    return (
        <div className={styles.container}>
            {/* Stats Cards */}
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
                />
                <StatCard
                    IconComponent={XCircle}
                    label="Cancelled Orders"
                    value={stats?.orderCounts?.cancelled || 0}
                    accentColor="red"
                />
            </div>

            {/* Transactions & Reviews */}
            <div className={styles.contentGrid}>
                {/* Recent Transactions Card */}
                <Card>
                    <CardHeader>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <DollarSign size={20} style={{ color: 'var(--color-primary-600)' }} />
                            <CardTitle>Recent Transactions</CardTitle>
                        </div>
                    </CardHeader>
                    <CardBody>
                        {transactions.length > 0 ? (
                            <div className={styles.transactionsList}>
                                {transactions.map((tx) => (
                                    <div key={tx.id} className={styles.transactionItem}>
                                        <div className={styles.transactionInfo}>
                                            <h4 className={styles.transactionService}>
                                                {tx.service?.name || 'Service'}
                                            </h4>
                                            <p className={styles.transactionDate}>
                                                <Calendar size={12} />
                                                {formatDate(tx.created_at)}
                                            </p>
                                        </div>
                                        <div className={styles.transactionAmount}>
                                            {formatCurrency(tx.final_price || 0)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>💰</div>
                                <p className={styles.emptyText}>No completed transactions yet</p>
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Customer Reviews Card */}
                <Card>
                    <CardHeader>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <Star size={20} style={{ color: 'var(--color-primary-600)' }} />
                            <CardTitle>Customer Reviews</CardTitle>
                        </div>
                    </CardHeader>
                    <CardBody>
                        {reviews.length > 0 ? (
                            <div className={styles.reviewsList}>
                                {reviews.map((review) => (
                                    <div key={review.id} className={styles.reviewItem}>
                                        <div className={styles.reviewHeader}>
                                            <div className={styles.reviewerInfo}>
                                                <span className={styles.reviewerName}>
                                                    {review.user?.full_name || 'Anonymous'}
                                                </span>
                                                <span className={styles.reviewDate}>
                                                    {formatDate(review.created_at)}
                                                </span>
                                            </div>
                                            <div className={styles.reviewRating}>
                                                <Star size={14} fill="var(--color-amber-500)" color="var(--color-amber-500)" />
                                                <span>{review.rating.toFixed(1)}</span>
                                            </div>
                                        </div>
                                        <p className={styles.reviewText}>
                                            "{review.review_text || 'No comment provided'}"
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>⭐</div>
                                <p className={styles.emptyText}>No reviews yet</p>
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>
        </div>
    )
}
