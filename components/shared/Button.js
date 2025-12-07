export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    onClick,
    type = 'button',
    className = '',
    ...props
}) {
    const baseClass = 'btn'
    const variantClass = `btn-${variant}`
    const sizeClass = size !== 'md' ? `btn-${size}` : ''

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
            {...props}
        >
            {loading && (
                <span className="btn-spinner">
                    <span className="spinner-small"></span>
                </span>
            )}
            {children}
            <style jsx>{`
        .btn-spinner {
          display: inline-flex;
          align-items: center;
          margin-right: 8px;
        }

        .spinner-small {
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: currentColor;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          pointer-events: none;
        }
      `}</style>
        </button>
    )
}
