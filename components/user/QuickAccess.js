import Link from 'next/link'
import { Wallet, MapPin, MessageCircle, History } from 'lucide-react'
import styles from '../../styles/QuickAccess.module.css'

export default function QuickAccess({ walletBalance, totalBookings }) {
  return (
    <div className={styles.container}>
      <Link href="/wallet" className={styles.item}>
        <div className={styles.icon}>
          <Wallet size={20} />
        </div>
        <div className={styles.content}>
          <span className={styles.label}>Wallet</span>
          <span className={styles.value}>₹{walletBalance || 0}</span>
        </div>
      </Link>

      <Link href="/bookings" className={styles.item}>
        <div className={`${styles.icon} ${styles.iconBookings}`}>
          <History size={20} />
        </div>
        <div className={styles.content}>
          <span className={styles.label}>Bookings</span>
          <span className={styles.value}>{totalBookings || 0}</span>
        </div>
      </Link>

      <Link href="/addresses" className={styles.item}>
        <div className={`${styles.icon} ${styles.iconAddress}`}>
          <MapPin size={20} />
        </div>
        <div className={styles.content}>
          <span className={styles.label}>Addresses</span>
          <span className={styles.value}>Manage</span>
        </div>
      </Link>

      <Link href="/help" className={styles.item}>
        <div className={`${styles.icon} ${styles.iconSupport}`}>
          <MessageCircle size={20} />
        </div>
        <div className={styles.content}>
          <span className={styles.label}>Support</span>
          <span className={styles.value}>24/7</span>
        </div>
      </Link>
    </div>
  )
}
