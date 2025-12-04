import styles from '../../styles/ProviderHome.module.css'

export default function StatCard({ icon, label, value, accentColor = 'blue', trend, IconComponent }) {
    const getAccentClass = () => {
        switch (accentColor) {
            case 'green':
                return styles.accentGreen
            case 'yellow':
                return styles.accentYellow
            case 'blue':
                return styles.accentBlue
            case 'red':
                return styles.accentRed
            case 'purple':
                return styles.accentPurple
            default:
                return styles.accentBlue
        }
    }

    return (
        <div className={`${styles.statCard} ${getAccentClass()}`}>
            <div className={styles.statIcon}>
                {IconComponent ? <IconComponent size={28} /> : icon}
            </div>
            <div className={styles.statContent}>
                <div className={styles.statLabel}>{label}</div>
                <div className={styles.statValueRow}>
                    <div className={styles.statValue}>{value}</div>
                    {trend && (
                        <span className={`${styles.statTrend} ${trend.startsWith('+') || trend.startsWith('↑') ? styles.trendUp : styles.trendDown}`}>
                            {trend}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}
