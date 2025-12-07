export default function Card({
    children,
    interactive = false,
    className = '',
    onClick,
    ...props
}) {
    const baseClass = 'card'
    const interactiveClass = interactive ? 'card-interactive' : ''

    return (
        <div
            className={`${baseClass} ${interactiveClass} ${className}`}
            onClick={interactive ? onClick : undefined}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
            {...props}
        >
            {children}
        </div>
    )
}

// Card Header Component
export function CardHeader({ children, className = '' }) {
    return (
        <div className={`card-header ${className}`}>
            {children}
            <style jsx>{`
        .card-header {
          padding-bottom: var(--space-4);
          margin-bottom: var(--space-4);
          border-bottom: 1px solid var(--color-border);
        }
      `}</style>
        </div>
    )
}

// Card Title Component
export function CardTitle({ children, className = '' }) {
    return (
        <h3 className={`card-title ${className}`}>
            {children}
            <style jsx>{`
        .card-title {
          font-size: var(--font-size-xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-text-primary);
          margin: 0;
          line-height: var(--line-height-tight);
        }
      `}</style>
        </h3>
    )
}

// Card Body Component
export function CardBody({ children, className = '' }) {
    return (
        <div className={`card-body ${className}`}>
            {children}
        </div>
    )
}

// Card Footer Component
export function CardFooter({ children, className = '' }) {
    return (
        <div className={`card-footer ${className}`}>
            {children}
            <style jsx>{`
        .card-footer {
          padding-top: var(--space-4);
          margin-top: var(--space-4);
          border-top: 1px solid var(--color-border);
        }
      `}</style>
        </div>
    )
}
