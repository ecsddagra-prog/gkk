import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import axios from 'axios'
import toast from 'react-hot-toast'
import {
    LayoutDashboard,
    User,
    Calendar,
    Wrench,
    MapPin,
    DollarSign,
    Award,
    FileText,
    CreditCard,
    Users,
    TrendingUp,
    LogOut,
    Menu,
    X,
    Sparkles,
    CheckCircle2
} from 'lucide-react'
import { ThemeToggle } from '../shared'
import styles from '../../styles/ProviderSidebar.module.css'

export default function ProviderLayout({ children, activeModule, setActiveModule }) {
    const router = useRouter()
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [providerName, setProviderName] = useState('')
    const [isVerified, setIsVerified] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [showNotifications, setShowNotifications] = useState(false)
    const notificationRef = useRef(null)

    useEffect(() => {
        // Close mobile menu on route change
        const handleRouteChange = () => {
            setIsMobileOpen(false)
        }
        router.events?.on('routeChangeStart', handleRouteChange)
        return () => {
            router.events?.off('routeChangeStart', handleRouteChange)
        }
    }, [router])

    useEffect(() => {
        // Get provider name from localStorage or sessionStorage
        const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}') : {}
        setProviderName(user.name || user.email?.split('@')[0] || 'Provider')
        // Mock verified status - in production, fetch from API
        setIsVerified(true)

        if (user.id) {
            fetchNotifications()
            setupRealtimeNotifications(user.id)
        }

        // Click outside to close notifications
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const fetchNotifications = async () => {
        try {
            const token = (await supabase.auth.getSession()).data.session?.access_token
            const { data } = await axios.get('/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setNotifications(data.notifications || [])
            setUnreadCount(data.notifications?.filter(n => !n.is_read).length || 0)
        } catch (error) {
            console.error('Error fetching notifications:', error)
        }
    }

    const setupRealtimeNotifications = (userId) => {
        const channel = supabase
            .channel(`public:notifications:user_id=eq.${userId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${userId}`
            }, (payload) => {
                const newNotification = payload.new
                setNotifications(prev => [newNotification, ...prev])
                setUnreadCount(prev => prev + 1)
                toast.success(newNotification.title + ': ' + newNotification.message, {
                    icon: '🔔',
                    duration: 5000
                })
            })
            .subscribe()

        return () => supabase.removeChannel(channel)
    }

    const markAsRead = async (notificationId) => {
        try {
            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notificationId)

            setNotifications(notifications.map(n =>
                n.id === notificationId ? { ...n, is_read: true } : n
            ))
            setUnreadCount(Math.max(0, unreadCount - 1))
        } catch (error) {
            console.error('Error marking as read:', error)
        }
    }

    const menuItems = [
        { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'bookings', label: 'My Bookings', icon: Calendar },
        { id: 'services-portfolio', label: 'Services & Portfolio', icon: Wrench },
        { id: 'growth-customers', label: 'Growth & Customers', icon: TrendingUp },
        { id: 'profile-settings', label: 'Profile & Settings', icon: User },
    ]

    const handleNavClick = (item) => {
        if (item.link) {
            // Always use router for items with explicit links
            router.push(item.link)
        } else if (setActiveModule) {
            // Use setActiveModule if provided (dashboard mode)
            setActiveModule(item.id)
        } else {
            // Fallback to dashboard route with module query param
            router.push({
                pathname: '/provider/dashboard',
                query: { module: item.id }
            })
        }
        setIsMobileOpen(false)
    }

    const handleLogout = async () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('user')
            sessionStorage.removeItem('user')
        }
        router.push('/login')
    }

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Mobile Hamburger Button */}
            <button
                className={styles.hamburger}
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                aria-label="Toggle menu"
                aria-expanded={isMobileOpen}
            >
                {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className={styles.overlay}
                    onClick={() => setIsMobileOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ''} ${isMobileOpen ? styles.sidebarOpen : ''
                    }`}
                role="navigation"
                aria-label="Provider navigation"
            >
                {/* Provider Header */}
                <div className={styles.providerHeader}>
                    <div className={styles.logoSection}>
                        <div className={styles.logoIcon}>
                            <Sparkles size={24} />
                        </div>
                        <h1 className={styles.logoText}>Provider Panel</h1>
                    </div>
                </div>

                {/* Navigation Items */}
                <nav className={styles.navigation}>
                    <ul className={styles.navList}>
                        {menuItems.map((item) => {
                            const Icon = item.icon
                            const isActive = item.link
                                ? router.pathname === item.link
                                : activeModule === item.id

                            return (
                                <li key={item.id} className={styles.navItem}>
                                    {item.link ? (
                                        <Link
                                            href={item.link}
                                            className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                                            aria-current={isActive ? 'page' : undefined}
                                        >
                                            <Icon className={styles.navIcon} size={22} />
                                            <span className={styles.navLabel}>{item.label}</span>
                                            <span className={styles.tooltip}>{item.label}</span>
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={() => handleNavClick(item)}
                                            className={`${styles.navButton} ${isActive ? styles.active : ''}`}
                                            aria-current={isActive ? 'page' : undefined}
                                        >
                                            <Icon className={styles.navIcon} size={22} />
                                            <span className={styles.navLabel}>{item.label}</span>
                                            <span className={styles.tooltip}>{item.label}</span>
                                        </button>
                                    )}
                                </li>
                            )
                        })}
                    </ul>
                </nav>

                {/* Logout Section */}
                <div className={styles.logoutSection}>
                    <button
                        onClick={handleLogout}
                        className={styles.logoutButton}
                        aria-label="Logout"
                    >
                        <LogOut className={styles.navIcon} size={22} />
                        <span className={styles.navLabel}>Logout</span>
                        <span className={styles.tooltip}>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden" style={{ marginLeft: isMobileOpen ? 0 : 'var(--sidebar-width, 280px)' }}>
                <header className="glass" style={{
                    padding: 'var(--space-4) var(--space-6)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 20,
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{
                        fontSize: 'var(--font-size-2xl)',
                        fontWeight: 'var(--font-weight-bold)',
                        color: 'var(--color-text-primary)',
                        margin: 0
                    }}>
                        {menuItems.find(m => m.id === activeModule)?.label || 'Dashboard'}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                        <span style={{
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--color-text-secondary)',
                            fontWeight: 'var(--font-weight-medium)'
                        }}>
                            Welcome, {providerName}
                        </span>
                        <div style={{ position: 'relative' }} ref={notificationRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                style={{
                                    background: 'var(--color-background-secondary)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: 'var(--space-2)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative'
                                }}
                                title="Notifications"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                                </svg>
                                {unreadCount > 0 && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '-2px',
                                        right: '-2px',
                                        minWidth: '16px',
                                        height: '16px',
                                        background: 'var(--color-error)',
                                        color: 'white',
                                        fontSize: '10px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '0 4px',
                                        fontWeight: 'bold'
                                    }}>
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    marginTop: 'var(--space-2)',
                                    width: '320px',
                                    maxHeight: '400px',
                                    background: 'var(--color-background-primary)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-lg)',
                                    boxShadow: 'var(--shadow-lg)',
                                    zIndex: 100,
                                    overflowY: 'auto'
                                }}>
                                    <div style={{
                                        padding: 'var(--space-4)',
                                        borderBottom: '1px solid var(--color-border)',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <span>Notifications</span>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={() => {
                                                    notifications.filter(n => !n.is_read).forEach(n => markAsRead(n.id))
                                                }}
                                                style={{
                                                    fontSize: 'var(--font-size-xs)',
                                                    color: 'var(--color-primary)',
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Mark all as read
                                            </button>
                                        )}
                                    </div>
                                    <div style={{ padding: 'var(--space-2)' }}>
                                        {notifications.length === 0 ? (
                                            <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                                                No notifications yet
                                            </div>
                                        ) : (
                                            notifications.map(n => (
                                                <div
                                                    key={n.id}
                                                    onClick={() => !n.is_read && markAsRead(n.id)}
                                                    style={{
                                                        padding: 'var(--space-3)',
                                                        borderRadius: 'var(--radius-md)',
                                                        marginBottom: 'var(--space-1)',
                                                        background: n.is_read ? 'transparent' : 'var(--color-background-secondary)',
                                                        cursor: 'pointer',
                                                        transition: 'background 0.2s',
                                                        position: 'relative'
                                                    }}
                                                >
                                                    {!n.is_read && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            left: 'var(--space-1)',
                                                            top: '50%',
                                                            transform: 'translateY(-50%)',
                                                            width: '6px',
                                                            height: '6px',
                                                            background: 'var(--color-primary)',
                                                            borderRadius: '50%'
                                                        }} />
                                                    )}
                                                    <div style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-1)', paddingLeft: n.is_read ? 0 : 'var(--space-3)' }}>
                                                        {n.title}
                                                    </div>
                                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', paddingLeft: n.is_read ? 0 : 'var(--space-3)' }}>
                                                        {n.message}
                                                    </div>
                                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)', paddingLeft: n.is_read ? 0 : 'var(--space-3)' }}>
                                                        {new Date(n.created_at).toLocaleString()}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <ThemeToggle />
                    </div>
                </header>
                <main className="flex-1 overflow-auto p-6 pb-20">
                    {children}
                </main>
            </div>

            {/* Responsive Style Injection */}
            <style jsx>{`
        @media (max-width: 768px) {
          .flex-1 {
            margin-left: 0 !important;
          }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .flex-1 {
            margin-left: 80px !important;
          }
        }
        @media (min-width: 1025px) {
          .flex-1 {
            margin-left: 280px !important;
          }
        }
      `}</style>
        </div>
    )
}
