import { useState } from 'react'
import { MapPin, Star, Clock, Award } from 'lucide-react'
import styles from '../../styles/ProviderPreview.module.css'

export default function ProviderPreview({ providers, selectedService, onProviderSelect }) {
  const [viewAll, setViewAll] = useState(false)

  const displayProviders = viewAll ? providers : providers.slice(0, 4)

  if (!providers || providers.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No providers available for this service</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          Available Providers
          {selectedService && <span className={styles.serviceName}> for {selectedService.name}</span>}
        </h3>
        <p className={styles.subtitle}>{providers.length} professionals ready to serve</p>
      </div>

      <div className={styles.grid}>
        {displayProviders.map(provider => (
          <div 
            key={provider.id} 
            className={styles.card}
            onClick={() => onProviderSelect(provider)}
          >
            <div className={styles.cardHeader}>
              <div className={styles.avatar}>
                {provider.business_name?.[0] || provider.user?.full_name?.[0] || 'P'}
              </div>
              <div className={styles.info}>
                <h4 className={styles.name}>
                  {provider.business_name || provider.user?.full_name || 'Provider'}
                </h4>
                <div className={styles.rating}>
                  <Star size={14} fill="#fbbf24" color="#fbbf24" />
                  <span>{provider.avg_rating || '4.5'}</span>
                  <span className={styles.reviews}>({provider.total_reviews || 0})</span>
                </div>
              </div>
            </div>

            <div className={styles.details}>
              <div className={styles.detailItem}>
                <MapPin size={14} />
                <span>{provider.service_area || 'Nearby'}</span>
              </div>
              <div className={styles.detailItem}>
                <Clock size={14} />
                <span>{provider.is_available ? 'Available Now' : 'Busy'}</span>
              </div>
              <div className={styles.detailItem}>
                <Award size={14} />
                <span>{provider.experience_years || 0}+ years exp</span>
              </div>
            </div>

            <div className={styles.footer}>
              <div className={styles.price}>
                ₹{provider.starting_price || selectedService?.base_price || 0}
                <span className={styles.priceLabel}>/starting</span>
              </div>
              <button className={styles.selectBtn}>Select</button>
            </div>
          </div>
        ))}
      </div>

      {providers.length > 4 && !viewAll && (
        <div className={styles.viewAllWrapper}>
          <button onClick={() => setViewAll(true)} className={styles.viewAllBtn}>
            View All {providers.length} Providers
          </button>
        </div>
      )}
    </div>
  )
}
