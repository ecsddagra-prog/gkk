import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import Link from 'next/link'
import { formatCurrency, formatDate, getStatusLabel, getStatusColor } from '../lib/utils'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Calendar, MapPin, ChevronRight, Hash, User } from 'lucide-react'

export default function Bookings({ user }) {
  const router = useRouter()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    loadBookings()

    const subscription = supabase
      .channel('public:bookings')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        loadBookings()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [user, filter])

  const loadBookings = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      let query = supabase
        .from('bookings')
        .select('*, service:services(*), provider:providers!bookings_provider_id_fkey(*, user:users(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query
      if (!error) setBookings(data || [])
    } catch (error) {
      console.error('Error loading bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  const filters = [
    { id: 'all', label: 'All Services' },
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Scheduled' },
    { id: 'in_progress', label: 'Ongoing' },
    { id: 'completed', label: 'Finished' },
  ]

  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      <Header user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="mb-16">
          <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-3">Order History</p>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">
            My <span className="text-purple-600 italic">Bookings</span>
          </h1>
          <p className="text-gray-400 font-bold mt-4 uppercase tracking-widest text-[10px]">Manage and track your active service requests</p>
        </div>

        {/* Premium Filter Pills */}
        <div className="flex flex-wrap gap-4 mb-12">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-8 py-4 rounded-[20px] font-black text-[10px] uppercase tracking-widest transition-all shadow-sm ${filter === f.id
                ? 'bg-gray-900 text-white shadow-xl shadow-gray-200 ring-4 ring-gray-100'
                : 'bg-white text-gray-400 hover:text-gray-600 border border-gray-100 hover:border-gray-200'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-32 glass-premium bg-white/50 rounded-[48px] border border-white shadow-xl">
            <div className="text-8xl mb-8 opacity-10">📦</div>
            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Empty Archive</h3>
            <p className="text-gray-400 font-bold mt-2 mb-10 uppercase tracking-widest text-[10px] max-w-sm mx-auto">You haven't initiated any professional service requests yet.</p>
            <Link
              href="/services"
              className="px-10 py-4 bg-purple-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-purple-100 hover:bg-purple-700 transition-all active:scale-95"
            >
              Discover Services
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {bookings.map(booking => (
              <div key={booking.id} className="group relative">
                <Link href={`/booking/${booking.id}`}>
                  <div className="glass-premium bg-white/70 rounded-[40px] p-10 border border-white shadow-xl hover:shadow-2xl transition-all cursor-pointer h-full border-transparent hover:border-purple-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 transition-opacity group-hover:opacity-100"></div>

                    <div className="flex justify-between items-start mb-10 relative z-10">
                      <div className="flex gap-6 items-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-[24px] flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                          {booking.service?.category?.icon || '🛠️'}
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-gray-900 group-hover:text-purple-600 transition-colors uppercase tracking-tighter leading-none mb-2">
                            {booking.service?.name}
                          </h3>
                          <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase flex items-center gap-1">
                            <Hash className="w-3 h-3" /> {booking.booking_number}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 mb-10 relative z-10">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-purple-400 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Schedule</p>
                          <p className="text-sm font-bold text-gray-700">
                            {formatDate(booking.scheduled_date || booking.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-purple-400 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</p>
                          <p className="text-sm font-bold text-gray-700 line-clamp-1">
                            {booking.service_address}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-8 border-t border-gray-100 relative z-10">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Value</p>
                        <div className="text-3xl font-black text-gray-900 tracking-tighter">
                          {booking.final_price ? `₹${booking.final_price}` : `₹${booking.base_charge || 0}`}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <span className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest shadow-sm ${booking.status === 'completed' ? 'bg-green-100 text-green-600' :
                          booking.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                            'bg-purple-100 text-purple-600'
                          }`}>
                          {getStatusLabel(booking.status)}
                        </span>
                        <div className="flex items-center gap-1 text-purple-600 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                          View <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

