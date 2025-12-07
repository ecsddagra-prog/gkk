// Skeleton for loading states

export default function LoadingSkeleton({
    variant = 'text',
    width,
    height,
    count = 1,
    className = ''
}) {
    const skeletons = Array.from({ length: count })

    if (variant === 'text') {
        return (
            <>
                {skeletons.map((_, index) => (
                    <div
                        key={index}
                        className={`skeleton skeleton-text ${className}`}
                        style={{ width: width || '100%', height: height || '16px' }}
                    />
                ))}
            </>
        )
    }

    if (variant === 'card') {
        return (
            <div className={`skeleton skeleton-card ${className}`}>
                <div className="skeleton skeleton-image" />
                <div className="skeleton-content">
                    <div className="skeleton skeleton-text" style={{ width: '60%' }} />
                    <div className="skeleton skeleton-text" style={{ width: '40%' }} />
                </div>
                <style jsx>{`
          .skeleton-card {
            border-radius: var(--radius-xl);
            padding: var(--space-6);
            width: ${width || '100%'};
            height: ${height || 'auto'};
          }

          .skeleton-image {
            width: 100%;
            height: 200px;
            margin-bottom: var(--space-4);
            border-radius: var(--radius-lg);
          }

          .skeleton-content {
            display: flex;
            flex-direction: column;
            gap: var(--space-3);
          }

          .skeleton-text {
            height: 16px;
            border-radius: var(--radius-sm);
          }
        `}</style>
            </div>
        )
    }

    if (variant === 'circle') {
        return (
            <div
                className={`skeleton skeleton-circle ${className}`}
                style={{
                    width: width || '40px',
                    height: height || width || '40px',
                    borderRadius: '50%'
                }}
            />
        )
    }

    if (variant === 'rect') {
        return (
            <div
                className={`skeleton ${className}`}
                style={{
                    width: width || '100%',
                    height: height || '100px',
                    borderRadius: 'var(--radius-md)'
                }}
            />
        )
    }

    return null
}

// Stat Card Skeleton
export function StatCardSkeleton({ count = 4 }) {
    return (
        <div className="stats-grid">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="stat-card-skeleton">
                    <LoadingSkeleton variant="circle" width="60px" height="60px" />
                    <div className="stat-content">
                        <LoadingSkeleton variant="text" width="80px" height="12px" />
                        <LoadingSkeleton variant="text" width="120px" height="24px" />
                    </div>
                </div>
            ))}
            <style jsx>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--space-4);
        }

        .stat-card-skeleton {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-6);
          background: var(--color-surface);
          border-radius: var(--radius-xl);
          border: 1px solid var(--color-border);
        }

        .stat-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          flex: 1;
        }
      `}</style>
        </div>
    )
}

// Table Skeleton
export function TableSkeleton({ rows = 5, columns = 4 }) {
    return (
        <div className="table-skeleton">
            {/* Header */}
            <div className="table-header">
                {Array.from({ length: columns }).map((_, index) => (
                    <LoadingSkeleton key={index} variant="text" width="80%" height="14px" />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="table-row">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <LoadingSkeleton key={colIndex} variant="text" width="90%" height="14px" />
                    ))}
                </div>
            ))}
            <style jsx>{`
        .table-skeleton {
          width: 100%;
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .table-header,
        .table-row {
          display: grid;
          grid-template-columns: repeat(${columns}, 1fr);
          gap: var(--space-4);
          padding: var(--space-4);
        }

        .table-header {
          background: var(--color-background-secondary);
          border-bottom: 1px solid var(--color-border);
        }

        .table-row {
          border-bottom: 1px solid var(--color-border);
        }

        .table-row:last-child {
          border-bottom: none;
        }
      `}</style>
        </div>
    )
}
