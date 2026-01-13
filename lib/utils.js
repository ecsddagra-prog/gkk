// Format currency in Indian Rupees
export function formatCurrency(amount) {
  const value = amount || 0

  // Fallback for browsers that don't properly support INR symbol
  try {
    const formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      currencyDisplay: 'symbol',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)

    // If $ appears instead of ₹, replace it
    if (formatted.includes('$')) {
      return formatted.replace('$', '₹')
    }

    return formatted
  } catch (error) {
    // Fallback to manual formatting
    const numValue = Number(value)
    return `₹${numValue.toLocaleString('en-IN')}`
  }
}

// Format date
export function formatDate(date, format = 'dd MMM yyyy') {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

// Format datetime
export function formatDateTime(date) {
  if (!date) return ''
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Validate phone number (Indian)
export function validatePhone(phone) {
  const phoneRegex = /^[6-9]\d{9}$/
  return phoneRegex.test(phone.replace(/\D/g, ''))
}

// Validate email
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Generate OTP
export function generateOTP(length = 6) {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Debounce function
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Get status color
export function getStatusColor(status) {
  const colors = {
    pending: 'yellow',
    quote_requested: 'blue',
    quote_sent: 'purple',
    quote_accepted: 'green',
    confirmed: 'green',
    on_way: 'blue',
    in_progress: 'blue',
    completed: 'green',
    cancelled: 'red',
    disputed: 'orange'
  }
  return colors[status] || 'gray'
}

// Get status label
export function getStatusLabel(status) {
  const labels = {
    pending: 'Pending',
    quote_requested: 'Quote Requested',
    quote_sent: 'Quote Sent',
    quote_accepted: 'Quote Accepted',
    confirmed: 'Confirmed',
    on_way: 'On the Way',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    disputed: 'Disputed'
  }
  return labels[status] || status
}

// Calculate cashback
export function calculateCashback(amount, percentage = 5) {
  return Math.round((amount * percentage) / 100)
}

// Calculate rewards
export function calculateRewards(amount, pointsPer100 = 10) {
  return Math.round((amount / 100) * pointsPer100)
}

// Check if rating is low (for suspension)
export function checkLowRating(ratings) {
  if (ratings.length < 3) return false
  const lastThree = ratings.slice(-3)
  return lastThree.every(r => r.rating <= 2)
}

// Generate referral code
export function generateReferralCode(userId) {
  const prefix = 'HS'
  const timestamp = Date.now().toString(36).toUpperCase()
  const userIdShort = userId.substring(0, 6).toUpperCase()
  return `${prefix}${timestamp}${userIdShort}`
}
