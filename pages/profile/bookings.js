import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import Header from '../../components/Header'
import { Calendar, MapPin, ChevronRight } from 'lucide-react'
import { formatDate, getStatusLabel } from '../../lib/utils'

export default function Bookings({ user }) {
    const router = useRouter()
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) {
            router.push('/login')
            return
        }
        loadBookings()
    }, [user])

    const loadBookings = async () => {
        try {
            const { data } = await supabase
                .from('bookings')
                .select('*, service:services(*), provider:providers!bookings_provider_id_fkey(*, user:users(*))')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            setBookings(data || [])
        } catch (error) {
            console.error('Error loading bookings:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#F8F9FD]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F8F9FD]">
            <Header user={user} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <Link href="/profile" className="text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2 mb-4 font-medium">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                        Back to Profile
                    </Link>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Orders & Bookings</h1>
                    <p className="text-gray-500 mt-2">View your complete service history.</p>
                </div>

                {bookings.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <div className="text-6xl mb-4">📅</div>
                        <h3 className="text-xl font-bold text-gray-900">No bookings yet</h3>
                        <p className="text-gray-500 mt-2">Explore services and make your first booking!</p>
                        <Link href="/" className="inline-block mt-6 px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors">
                            Browse Services
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bookings.map(booking => (
                            <Link href={`/booking/${booking.id}`} key={booking.id}>
                                <div className="glass-premium bg-white rounded-[32px] p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:border-purple-200 group">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest ${booking.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                                            }`}>
                                            {getStatusLabel(booking.status)}
                                        </span>
                                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-purple-600 transition-colors" />
                                    </div>
                                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter mb-4">{booking.service?.name}</h3>
                                    <div className="space-y-2 mb-6">
                                        <div className="flex items-center gap-2 text-gray-500 font-bold text-xs">
                                            <Calendar className="w-3.5 h-3.5 text-purple-400" /> {formatDate(booking.scheduled_date || booking.created_at)}
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500 font-bold text-xs">
                                            <MapPin className="w-3.5 h-3.5 text-purple-400" /> {booking.service_address?.split(',')[0]}
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-full overflow-hidden border border-white shadow-sm">
                                            {booking.provider?.user?.image_url ? (
                                                <img src={booking.provider.user.image_url} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-purple-50 text-purple-600 text-[10px] font-black">
                                                    {booking.provider?.user?.full_name?.charAt(0) || 'P'}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            {booking.provider?.user?.full_name || 'Assigning Pro...'}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
