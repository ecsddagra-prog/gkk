import Link from 'next/link'
import styles from '../../styles/provider-dashboard.module.css'

export default function QuickActionCard({ icon, label, link, onClick, color = 'blue' }) {
    const getColorClass = () => {
        switch (color) {
            case 'blue':
                return styles.actionBlue
            case 'purple':
                return styles.actionPurple
            case 'green':
                return styles.actionGreen
            case 'orange':
                return styles.actionOrange
            default:
                return styles.actionBlue
        }
    }

    const cardClass = `${styles.quickActionCard} ${getColorClass()}`

    if (link) {
        return (
            <Link href={link} className={cardClass}>
                <div className={styles.actionIcon}>{icon}</div>
                <div className={styles.actionLabel}>{label}</div>
            </Link>
        )
    }

    return (
        <button onClick={onClick} className={cardClass}>
            <div className={styles.actionIcon}>{icon}</div>
            <div className={styles.actionLabel}>{label}</div>
        </button>
    )
}
