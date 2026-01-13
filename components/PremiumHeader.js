import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { Bell, Search } from 'lucide-react'
import styles from '../styles/PremiumHeader.module.css'

export default function PremiumHeader({ user, profile, onSearch }) {
  const router = useRouter()
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const notificationRef = useRef(null)

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }

    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [user])

  const fetchNotifications = async () => {
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
      
      setNotifications(data || [])
      setUnreadCount(data?.filter(n => !n.is_read).length || 0)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}>H</div>
          <span className={styles.logoText}>Home Solution</span>
        </Link>

        {/* Search Bar */}
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search for any service..."
            className={styles.searchInput}
            onChange={(e) => onSearch && onSearch(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {user && (
            <div className={styles.notificationWrapper} ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={styles.notificationButton}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className={styles.notificationBadge}>{unreadCount}</span>
                )}
              </button>

              {showNotifications && (
                <div className={styles.notificationDropdown}>
                  <div className={styles.notificationHeader}>
                    <span>Notifications</span>
                  </div>
                  <div className={styles.notificationList}>
                    {notifications.length === 0 ? (
                      <div className={styles.notificationEmpty}>
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={styles.notificationItem}>
                          <p className={styles.notificationTitle}>{n.title}</p>
                          <p className={styles.notificationMessage}>{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {user ? (
            <Link href="/profile" className={styles.profileButton}>
              <div className={styles.avatar}>
                {profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            </Link>
          ) : (
            <Link href="/login" className={styles.loginButton}>
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
