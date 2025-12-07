import { useState } from 'react'

export default function FormInput({
    label,
    type = 'text',
    value,
    onChange,
    error,
    helpText,
    required = false,
    disabled = false,
    placeholder,
    className = '',
    ...props
}) {
    const [isFocused, setIsFocused] = useState(false)
    const hasValue = value !== '' && value !== null && value !== undefined
    const isFloating = isFocused || hasValue

    const inputId = props.id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`

    return (
        <div className={`form-group ${className}`}>
            <div className="input-wrapper">
                <input
                    id={inputId}
                    type={type}
                    value={value || ''}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    disabled={disabled}
                    placeholder={!label ? placeholder : ''}
                    className={`input ${error ? 'input-error' : ''} ${label ? 'input-floating' : ''}`}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
                    {...props}
                />
                {label && (
                    <label
                        htmlFor={inputId}
                        className={`input-label ${isFloating ? 'floating' : ''}`}
                    >
                        {label}
                        {required && <span className="text-error"> *</span>}
                    </label>
                )}
            </div>

            {helpText && !error && (
                <p id={`${inputId}-help`} className="help-text">
                    {helpText}
                </p>
            )}

            {error && (
                <p id={`${inputId}-error`} className="error-text" role="alert">
                    {error}
                </p>
            )}

            <style jsx>{`
        .form-group {
          margin-bottom: var(--space-4);
        }

        .input-wrapper {
          position: relative;
        }

        .input-floating {
          padding-top: var(--space-6);
          padding-bottom: var(--space-2);
        }

        .input-label {
          position: absolute;
          left: var(--space-4);
          top: 50%;
          transform: translateY(-50%);
          font-size: var(--font-size-base);
          color: var(--color-text-tertiary);
          transition: all var(--transition-fast);
          pointer-events: none;
          background: var(--color-surface);
          padding: 0 var(--space-1);
        }

        .input-label.floating {
          top: var(--space-2);
          transform: translateY(0);
          font-size: var(--font-size-xs);
          color: var(--color-primary-500);
        }

        .input:focus + .input-label {
          color: var(--color-primary-500);
        }

        .input-error + .input-label {
          color: var(--color-error);
        }

        .help-text {
          margin-top: var(--space-2);
          font-size: var(--font-size-sm);
          color: var(--color-text-tertiary);
        }

        .error-text {
          margin-top: var(--space-2);
          font-size: var(--font-size-sm);
          color: var(--color-error);
          display: flex;
          align-items: center;
          gap: var(--space-1);
        }

        .error-text::before {
          content: '⚠';
        }

        .text-error {
          color: var(--color-error);
        }
      `}</style>
        </div>
    )
}

// Textarea variant
export function FormTextarea({
    label,
    value,
    onChange,
    error,
    helpText,
    required = false,
    disabled = false,
    rows = 4,
    className = '',
    ...props
}) {
    const [isFocused, setIsFocused] = useState(false)
    const hasValue = value !== '' && value !== null && value !== undefined
    const isFloating = isFocused || hasValue

    const textareaId = props.id || `textarea-${label?.toLowerCase().replace(/\s+/g, '-')}`

    return (
        <div className={`form-group ${className}`}>
            <div className="input-wrapper">
                <textarea
                    id={textareaId}
                    value={value || ''}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    disabled={disabled}
                    rows={rows}
                    className={`textarea ${error ? 'input-error' : ''} ${label ? 'input-floating' : ''}`}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? `${textareaId}-error` : helpText ? `${textareaId}-help` : undefined}
                    {...props}
                />
                {label && (
                    <label
                        htmlFor={textareaId}
                        className={`input-label ${isFloating ? 'floating' : ''}`}
                    >
                        {label}
                        {required && <span className="text-error"> *</span>}
                    </label>
                )}
            </div>

            {helpText && !error && (
                <p id={`${textareaId}-help`} className="help-text">
                    {helpText}
                </p>
            )}

            {error && (
                <p id={`${textareaId}-error`} className="error-text" role="alert">
                    {error}
                </p>
            )}
        </div>
    )
}

// Select variant
export function FormSelect({
    label,
    value,
    onChange,
    options = [],
    error,
    helpText,
    required = false,
    disabled = false,
    placeholder = 'Select an option',
    className = '',
    ...props
}) {
    const selectId = props.id || `select-${label?.toLowerCase().replace(/\s+/g, '-')}`
    const hasValue = value !== '' && value !== null && value !== undefined

    return (
        <div className={`form-group ${className}`}>
            <div className="input-wrapper">
                <select
                    id={selectId}
                    value={value || ''}
                    onChange={onChange}
                    disabled={disabled}
                    className={`select ${error ? 'input-error' : ''}`}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? `${selectId}-error` : helpText ? `${selectId}-help` : undefined}
                    {...props}
                >
                    {placeholder && <option value="">{placeholder}</option>}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {label && (
                    <label
                        htmlFor={selectId}
                        className={`select-label ${hasValue ? 'has-value' : ''}`}
                    >
                        {label}
                        {required && <span className="text-error"> *</span>}
                    </label>
                )}
            </div>

            {helpText && !error && (
                <p id={`${selectId}-help`} className="help-text">
                    {helpText}
                </p>
            )}

            {error && (
                <p id={`${selectId}-error`} className="error-text" role="alert">
                    {error}
                </p>
            )}

            <style jsx>{`
        .select-label {
          display: block;
          margin-bottom: var(--space-2);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          color: var(--color-text-secondary);
        }

        .select-label.has-value {
          color: var(--color-primary-500);
        }
      `}</style>
        </div>
    )
}
