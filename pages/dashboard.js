import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import axios from 'axios'
import { Zap, ArrowRight, Sparkles } from 'lucide-react'
import PremiumHeader from '../components/PremiumHeader'
import MosaicTile from '../components/MosaicTile'
import styles from '../styles/PremiumDashboard.module.css'

export default function Dashboard({ user }) {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedServices, setSelectedServices] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')

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

  const filteredServices = services
    .filter((service, index, self) => 
      index === self.findIndex(s => s.id === service.id)
    )
    .filter(s => {
      const matchesSearch = searchQuery ? s.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
      const matchesCategory = activeCategory === 'all' ? true : String(s.category_id) === String(activeCategory)
      return matchesSearch && matchesCategory
    })

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <PremiumHeader user={user} profile={profile} onSearch={setSearchQuery} />

      <main className={styles.main}>
        {/* Welcome Section */}
        <div className={styles.welcomeSection}>
          <div className={styles.welcomeContent}>
            <h1 className={styles.welcomeTitle}>
              Welcome back, <span className={styles.highlight}>{profile?.full_name?.split(' ')[0] || 'User'}</span>
            </h1>
            <p className={styles.welcomeSubtitle}>Your premium home service dashboard</p>
          </div>
          <div className={styles.rewardsCard}>
            <div className={styles.rewardsIcon}>
              <Sparkles className="w-6 h-6" />
            </div>
            <div className={styles.rewardsInfo}>
              <p className={styles.rewardsLabel}>REWARDS</p>
              <p className={styles.rewardsValue}>240 Points</p>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className={styles.categorySection}>
          <button
            onClick={() => setActiveCategory('all')}
            className={`${styles.categoryPill} ${activeCategory === 'all' ? styles.categoryPillActive : ''}`}
          >
            All Services
          </button>
          {categories.slice(0, 6).map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`${styles.categoryPill} ${activeCategory === cat.id ? styles.categoryPillActive : ''}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="mosaic-grid">
          {filteredServices.map((service, idx) => (
            <MosaicTile
              key={`${service.id}-${idx}`}
              service={service}
              category={categories.find(c => c.id === service.category_id)}
              size={idx === 0 ? 'xl' : idx % 3 === 0 ? 'large' : 'medium'}
              isSelected={selectedServices.some(s => s.id === service.id)}
              onToggleSelect={toggleServiceSelection}
            />
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔍</div>
            <p className={styles.emptyText}>No services found</p>
          </div>
        )}
      </main>

      {/* Floating Action Bar */}
      {selectedServices.length > 0 && (
        <div className={styles.floatingBar}>
          <div className={styles.floatingBarContent}>
            <div className={styles.selectedIcons}>
              {selectedServices.slice(0, 3).map(s => (
                <div key={s.id} className={styles.selectedIcon}>
                  {s.name.charAt(0)}
                </div>
              ))}
              {selectedServices.length > 3 && (
                <div className={styles.selectedIconMore}>
                  +{selectedServices.length - 3}
                </div>
              )}
            </div>
            <div className={styles.divider}></div>
            <button onClick={handleContinueBooking} className={styles.bookButton}>
              Book Now <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
