export default function Badge({
    children,
    variant = 'neutral',
    className = '',
    ...props
}) {
    const baseClass = 'badge'
    const variantClass = `badge-${variant}`

    return (
        <span
            className={`${baseClass} ${variantClass} ${className}`}
            {...props}
        >
            {children}
        </span>
    )
}

// Status Badge with icon support
export function StatusBadge({ status, children, className = '' }) {
    const variantMap = {
        'pending': 'warning',
        'assigned': 'info',
        'in_progress': 'info',
        'completed': 'success',
        'cancelled': 'error',
        'rejected': 'error',
        'approved': 'success',
        'verified': 'success',
        'active': 'success',
        'inactive': 'neutral',
    }

    const variant = variantMap[status?.toLowerCase()] || 'neutral'

    return (
        <Badge variant={variant} className={className}>
            {children || status?.replace(/_/g, ' ')}
        </Badge>
    )
}
