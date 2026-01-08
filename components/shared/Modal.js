import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true,
  className = ''
}) {
  const modalRef = useRef(null)

  // Handle ESC key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Handle click outside - only close if clicking directly on backdrop
  const handleBackdropClick = (e) => {
    // Only close if the click target is the backdrop itself, not a child
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Prevent modal content clicks from bubbling to backdrop
  const handleModalClick = (e) => {
    e.stopPropagation()
  }

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[95vw]'
  }

  return (
    <>
      <div
        className="modal-backdrop"
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
      >
        <div
          ref={modalRef}
          className={`modal card ${sizeClasses[size]} ${className}`}
          onClick={handleModalClick}
        >
          {/* Modal Header */}
          {(title || showClose) && (
            <div className="modal-header">
              {title && <h2 className="modal-title">{title}</h2>}
              {showClose && (
                <button
                  onClick={onClose}
                  className="modal-close"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          )}

          {/* Modal Body */}
          <div className="modal-body">
            {children}
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-6);
          padding-bottom: var(--space-4);
          border-bottom: 1px solid var(--color-border);
        }

        .modal-title {
          font-size: var(--font-size-2xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-text-primary);
          margin: 0;
        }

        .modal-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: transparent;
          border: none;
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .modal-close:hover {
          background: var(--color-background-secondary);
          color: var(--color-text-primary);
        }

        .modal-body {
          max-height: calc(90vh - 120px);
          overflow-y: auto;
        }

        @media (max-width: 768px) {
          .modal {
            max-width: 95vw !important;
            margin: var(--space-4);
          }

          .modal-title {
            font-size: var(--font-size-xl);
          }
        }
      `}</style>
    </>
  )
}

// Modal Footer Component
export function ModalFooter({ children, className = '' }) {
  return (
    <div className={`modal-footer ${className}`}>
      {children}
      <style jsx>{`
        .modal-footer {
          display: flex;
          gap: var(--space-3);
          justify-content: flex-end;
          margin-top: var(--space-6);
          padding-top: var(--space-4);
          border-top: 1px solid var(--color-border);
        }

        @media (max-width: 768px) {
          .modal-footer {
            flex-direction: column-reverse;
          }

          .modal-footer :global(button) {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
