import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function Header({ user, onSearch }) {
    const router = useRouter()
    const [notifications, setNotifications] = useState([])
    const [showNotifications, setShowNotifications] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const notificationRef = useRef(null)

    useEffect(() => {
        if (user) {
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
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [user])

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
                    duration: 4000
                })
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
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
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error('Error marking notification as read:', error)
        }
    }

    const markAllAsRead = async () => {
        try {
            const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
            if (unreadIds.length === 0) return

            await Promise.all(unreadIds.map(id => markAsRead(id)))
            toast.success('All notifications marked as read')
        } catch (error) {
            console.error('Error marking all as read:', error)
        }
    }

    const handleNotificationClick = (notification) => {
        // Mark as read
        if (!notification.is_read) {
            markAsRead(notification.id)
        }

        // Navigate to related booking if metadata contains booking_id
        if (notification.metadata && notification.metadata.booking_id) {
            router.push(`/booking/${notification.metadata.booking_id}`)
            setShowNotifications(false)
        }
    }

    return (
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-inner">H</div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block">Home Solution</h1>
                    </Link>

                    {/* Search Bar (Centered) */}
                    <div className="flex-1 max-w-xl px-4 md:px-12">
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </span>
                            <input
                                type="text"
                                onChange={(e) => onSearch && onSearch(e.target.value)}
                                placeholder="Search for any service..."
                                className="w-full bg-gray-100 border-none rounded-2xl py-3 pl-12 pr-4 text-gray-900 focus:ring-2 focus:ring-purple-600 transition-all placeholder:text-gray-500"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {user && (
                            <div style={{ position: 'relative' }} ref={notificationRef}>
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-full relative transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                                    {unreadCount > 0 && (
                                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                                    )}
                                </button>

                                {/* Notification Dropdown */}
                                {showNotifications && (
                                    <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                                                <span className="font-bold text-gray-900">Notifications</span>
                                            </div>
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={markAllAsRead}
                                                    className="text-xs font-bold text-purple-600 hover:text-purple-700"
                                                >
                                                    Mark all read
                                                </button>
                                            )}
                                        </div>

                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-8 text-center text-gray-400">
                                                    <svg className="w-12 h-12 mx-auto mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                                                    No notifications yet
                                                </div>
                                            ) : (
                                                notifications.map(n => (
                                                    <div
                                                        key={n.id}
                                                        onClick={() => handleNotificationClick(n)}
                                                        className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${!n.is_read ? 'bg-purple-50/30' : ''}`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!n.is_read ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-bold text-gray-900 text-sm mb-1">{n.title}</p>
                                                                <p className="text-xs text-gray-600 mb-2">{n.message}</p>
                                                                <p className="text-[10px] text-gray-400">
                                                                    {new Date(n.created_at).toLocaleDateString('en-US', {
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {user ? (
                            <Link href="/profile" className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-2xl transition-colors">
                                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-700 font-bold overflow-hidden border-2 border-white shadow-sm">
                                    <span className="text-sm">{user.email?.charAt(0).toUpperCase()}</span>
                                </div>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/login" className="px-4 py-2 text-gray-700 font-medium hover:text-purple-600 transition">
                                    Login
                                </Link>
                                <Link
                                    href="/signup"
                                    className="px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-black transition-all shadow-md active:scale-95"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
