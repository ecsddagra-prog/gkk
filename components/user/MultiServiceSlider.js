import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, TrendingUp, Sparkles } from 'lucide-react'
import styles from '../../styles/MultiServiceSlider.module.css'

export default function MultiServiceSlider({ services, onServiceSelect, userHistory = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)
  const sliderRef = useRef(null)
  const autoPlayRef = useRef(null)

  // Sort services by priority: user history > trending > new > others
  const sortedServices = [...services].sort((a, b) => {
    const aInHistory = userHistory.includes(a.id)
    const bInHistory = userHistory.includes(b.id)
    if (aInHistory && !bInHistory) return -1
    if (!aInHistory && bInHistory) return 1
    if (a.is_trending && !b.is_trending) return -1
    if (!a.is_trending && b.is_trending) return 1
    if (a.is_new && !b.is_new) return -1
    if (!a.is_new && b.is_new) return 1
    return 0
  })

  const itemsPerView = typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 
                       typeof window !== 'undefined' && window.innerWidth < 1024 ? 2 : 3

  const maxIndex = Math.max(0, sortedServices.length - itemsPerView)

  useEffect(() => {
    if (isAutoPlay && sortedServices.length > itemsPerView) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1))
      }, 4000)
    }
    return () => clearInterval(autoPlayRef.current)
  }, [isAutoPlay, maxIndex, sortedServices.length, itemsPerView])

  const handlePrev = () => {
    setIsAutoPlay(false)
    setCurrentIndex(prev => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setIsAutoPlay(false)
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1))
  }

  const getServiceIcon = (categoryName) => {
    const icons = {
      'Cleaning': '🧹',
      'Repair': '🔧',
      'Salon': '💇',
      'Tutor': '📚',
      'Food': '🍽️',
      'Vehicle': '🚗',
      'Health': '💊',
      'Pet': '🐾'
    }
    return icons[categoryName] || '⚡'
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Book Multiple Services</h2>
        <p className={styles.subtitle}>Swipe to explore all services</p>
      </div>

      <div className={styles.sliderWrapper}>
        {currentIndex > 0 && (
          <button onClick={handlePrev} className={`${styles.navBtn} ${styles.navBtnPrev}`}>
            <ChevronLeft size={24} />
          </button>
        )}

        <div className={styles.slider} ref={sliderRef}>
          <div 
            className={styles.track}
            style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
          >
            {sortedServices.map((service, idx) => {
              const isFeatured = idx < 3
              const isInHistory = userHistory.includes(service.id)
              
              return (
                <div 
                  key={service.id} 
                  className={`${styles.card} ${isFeatured ? styles.cardFeatured : ''}`}
                  onClick={() => onServiceSelect(service)}
                >
                  {service.is_new && (
                    <div className={styles.badge}>
                      <Sparkles size={12} />
                      New
                    </div>
                  )}
                  {service.is_trending && !service.is_new && (
                    <div className={`${styles.badge} ${styles.badgeTrending}`}>
                      <TrendingUp size={12} />
                      Trending
                    </div>
                  )}
                  {isInHistory && !service.is_new && !service.is_trending && (
                    <div className={`${styles.badge} ${styles.badgeHistory}`}>
                      ⭐ Booked Before
                    </div>
                  )}

                  <div className={styles.cardIcon}>
                    {getServiceIcon(service.category?.name)}
                  </div>

                  <h3 className={styles.cardTitle}>{service.name}</h3>
                  <p className={styles.cardDesc}>{service.description?.substring(0, 60)}...</p>

                  <div className={styles.cardFooter}>
                    <div className={styles.price}>
                      ₹{service.base_price}
                      <span className={styles.priceLabel}>/starting</span>
                    </div>
                    <div className={styles.rating}>
                      ⭐ {service.avg_rating || '4.5'}
                    </div>
                  </div>

                  <button className={styles.bookBtn}>Book Now</button>
                </div>
              )
            })}
          </div>
        </div>

        {currentIndex < maxIndex && (
          <button onClick={handleNext} className={`${styles.navBtn} ${styles.navBtnNext}`}>
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      <div className={styles.dots}>
        {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
          <button
            key={idx}
            className={`${styles.dot} ${idx === currentIndex ? styles.dotActive : ''}`}
            onClick={() => {
              setIsAutoPlay(false)
              setCurrentIndex(idx)
            }}
          />
        ))}
      </div>
    </div>
  )
}
