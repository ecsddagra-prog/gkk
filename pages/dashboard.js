import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import axios from 'axios'
import { Bell, User, Calendar, MapPin, ChevronRight, Layout, Zap, Star, ArrowRight } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import MosaicTile from '../components/MosaicTile'
import { formatDate, getStatusLabel } from '../lib/utils'

export default function Dashboard({ user }) {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedServices, setSelectedServices] = useState([])

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    loadData()

    const bookingsSubscription = supabase
      .channel('dashboard-bookings')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: `user_id=eq.${user.id}`
      }, () => loadData())
      .subscribe()

    return () => {
      supabase.removeChannel(bookingsSubscription)
    }
  }, [user])

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!profileData) return
      setProfile(profileData)

      // Role redirection
      if (profileData.role === 'superadmin' || profileData.role === 'admin') {
        router.replace('/admin/dashboard')
        return
      } else if (profileData.role === 'provider') {
        router.replace('/provider/dashboard')
        return
      }

      // Load Categories
      const { data: categoriesData } = await supabase
        .from('service_categories')
        .select('*')
        .eq('is_active', true)
        .order('name')
      setCategories(categoriesData || [])

      // Load Recent Bookings
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*, service:services(*), provider:providers!bookings_provider_id_fkey(*, user:users(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3)
      setBookings(bookingsData || [])

      // Load Services
      const { data: servicesResponse } = await axios.get(
        `/api/catalog/home-services?city_id=${profileData.city_id || ''}`
      )
      setServices(servicesResponse.services || [])

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleServiceSelection = (service) => {
    const isAlreadySelected = selectedServices.find(s => s.id === service.id)
    if (isAlreadySelected) {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id))
    } else {
      setSelectedServices([...selectedServices, service])
    }
  }

  const handleContinueBooking = () => {
    if (selectedServices.length === 0) return
    const ids = selectedServices.map(s => s.id).join(',')
    router.push(`/book-service?services=${ids}`)
  }

  const filteredServices = searchQuery
    ? services.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : services

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      <Header user={user} onSearch={setSearchQuery} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-tight mb-2">
              Welcome back, <span className="text-purple-600">{profile?.full_name?.split(' ')[0]}</span>
            </h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Your premium home service dashboard</p>
          </div>
          <div className="flex gap-4">
            <div className="glass-premium bg-white/50 px-6 py-4 rounded-3xl border border-white flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 shadow-inner">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rewards</p>
                <p className="text-lg font-black text-gray-900 leading-none">240 Points</p>
              </div>
            </div>
          </div>
        </div>



        {/* Discovery Section (Mosaic Grid) */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">Discover Services</h2>
            <div className="flex gap-2">
              {categories.slice(0, 4).map(cat => (
                <Link href={`/services/${cat.id}`} key={cat.id}>
                  <span className="px-5 py-2.5 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-purple-600 hover:border-purple-100 transition-all cursor-pointer shadow-sm">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="mosaic-grid">
            {filteredServices.map((service, idx) => (
              <MosaicTile
                key={service.id}
                service={service}
                category={categories.find(c => c.id === service.category_id)}
                size={idx === 0 ? 'xl' : idx % 3 === 0 ? 'large' : 'medium'}
                isSelected={selectedServices.some(s => s.id === service.id)}
                onToggleSelect={toggleServiceSelection}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Floating Action Bar for Selections */}
      {selectedServices.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-bounce-in">
          <div className="bg-gray-900 text-white px-10 py-6 rounded-[40px] shadow-2xl flex items-center gap-10 border border-white/10 backdrop-blur-xl">
            <div className="flex -space-x-4">
              {selectedServices.slice(0, 3).map(s => (
                <div key={s.id} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-lg border-2 border-gray-900">
                  {categories.find(c => c.id === s.category_id)?.icon || '🛠️'}
                </div>
              ))}
              {selectedServices.length > 3 && (
                <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-xs font-black shadow-lg border-2 border-gray-900">
                  +{selectedServices.length - 3}
                </div>
              )}
            </div>
            <div className="h-10 w-px bg-white/10"></div>
            <button
              onClick={handleContinueBooking}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black transition-all flex items-center gap-2 group"
            >
              Book Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      <Footer />

      <style jsx global>{`
        @keyframes bounce-in {
          0% { transform: translate(-50%, 100px); opacity: 0; }
          60% { transform: translate(-50%, -10px); opacity: 1; }
          100% { transform: translate(-50%, 0); }
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
    </div>
  )
}
