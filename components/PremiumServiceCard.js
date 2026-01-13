import { Star, Check } from 'lucide-react'
import styles from '../styles/PremiumServiceCard.module.css'

export default function PremiumServiceCard({ service, category, isLarge, isSelected, onToggleSelect }) {
  const handleClick = () => {
    onToggleSelect(service)
  }

  return (
    <div
      onClick={handleClick}
      className={`${styles.card} ${isLarge ? styles.cardLarge : ''} ${isSelected ? styles.cardSelected : ''}`}
    >
      {/* Icon & Price */}
      <div className={styles.cardHeader}>
        <div className={styles.iconCircle}>
          <span className={styles.icon}>{category?.icon || '🔧'}</span>
        </div>
        {service.base_price && (
          <div className={styles.priceTag}>
            ₹{service.base_price}+
          </div>
        )}
      </div>

      {/* Service Info */}
      <div className={styles.cardBody}>
        <h3 className={styles.serviceName}>{service.name}</h3>
        <p className={styles.categoryName}>{category?.name || 'Service'}</p>
      </div>

      {/* Rating */}
      <div className={styles.cardFooter}>
        <div className={styles.rating}>
          <Star className={styles.starIcon} />
          <span>4.8</span>
        </div>
      </div>

      {/* Selected Indicator */}
      {isSelected && (
        <div className={styles.selectedBadge}>
          <Check className="w-4 h-4" />
        </div>
      )}

      {/* Hover Glow Effect */}
      <div className={styles.glowEffect}></div>
    </div>
  )
}
