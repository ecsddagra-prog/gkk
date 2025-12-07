import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
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
    }, [])

    const menuItems = [
        { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'profile', label: 'My Profile', icon: User },
        { id: 'bookings', label: 'My Bookings', icon: Calendar, link: '/provider/bookings' },
        { id: 'subscribers', label: 'My Subscribers', icon: Users, link: '/provider/subscribers' },
        { id: 'services', label: 'Service Management', icon: Wrench },
        { id: 'location-management', label: 'Location Management', icon: MapPin },
        { id: 'pricing', label: 'Service Charges', icon: DollarSign },
        { id: 'portfolio', label: 'Experience & Portfolio', icon: Award },
        { id: 'documents', label: 'License & KYC', icon: FileText },
        { id: 'payment-settings', label: 'Payment Settings', icon: CreditCard },
        { id: 'staff', label: 'Staff Management', icon: Users },
        { id: 'earnings', label: 'Earnings & Reviews', icon: TrendingUp },
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

                    <div className={styles.providerInfo}>
                        <div className={styles.avatar}>
                            {getInitials(providerName)}

                        </div>
                        <div className={styles.providerDetails}>
                            <div className={styles.providerNameRow}>
                                <p className={styles.providerName}>{providerName}</p>
                                {isVerified && (
                                    <CheckCircle2 size={14} className={styles.verifiedIcon} />
                                )}
                            </div>
                            <p className={styles.providerRole}>Service Provider</p>
                        </div>
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
                        <button
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
                            <span style={{
                                position: 'absolute',
                                top: '-2px',
                                right: '-2px',
                                width: '8px',
                                height: '8px',
                                background: 'var(--color-error)',
                                borderRadius: '50%'
                            }}></span>
                        </button>
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
