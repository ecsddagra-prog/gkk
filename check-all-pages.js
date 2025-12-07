const axios = require('axios')
const fs = require('fs')
const path = require('path')

const BASE_URL = 'http://localhost:3000'

// Define all pages to test
const pages = [
  // Public pages
  { path: '/', name: 'Home' },
  { path: '/about', name: 'About' },
  { path: '/contact', name: 'Contact' },
  { path: '/help', name: 'Help' },
  { path: '/privacy', name: 'Privacy' },
  { path: '/terms', name: 'Terms' },
  { path: '/login', name: 'Login' },
  { path: '/signup', name: 'Signup' },
  
  // Services
  { path: '/services', name: 'Services List' },
  
  // User pages (require auth)
  { path: '/dashboard', name: 'User Dashboard', requiresAuth: true },
  { path: '/profile', name: 'Profile', requiresAuth: true },
  { path: '/bookings', name: 'Bookings', requiresAuth: true },
  { path: '/wallet', name: 'Wallet', requiresAuth: true },
  { path: '/addresses', name: 'Addresses', requiresAuth: true },
  { path: '/subscriptions', name: 'Subscriptions', requiresAuth: true },
  { path: '/my-subscriptions', name: 'My Subscriptions', requiresAuth: true },
  { path: '/book-service', name: 'Book Service', requiresAuth: true },
  
  // Provider pages (require provider auth)
  { path: '/provider/register', name: 'Provider Register' },
  { path: '/provider/dashboard', name: 'Provider Dashboard', requiresAuth: true },
  { path: '/provider/bookings', name: 'Provider Bookings', requiresAuth: true },
  { path: '/provider/documents', name: 'Provider Documents', requiresAuth: true },
  { path: '/provider/subscriptions', name: 'Provider Subscriptions', requiresAuth: true },
  { path: '/provider/subscribers', name: 'Provider Subscribers', requiresAuth: true },
  { path: '/provider/subservices', name: 'Provider Subservices', requiresAuth: true },
  { path: '/provider/broadcasts', name: 'Provider Broadcasts', requiresAuth: true },
  { path: '/provider/training', name: 'Provider Training', requiresAuth: true },
  
  // Admin pages (require admin auth)
  { path: '/admin/dashboard', name: 'Admin Dashboard', requiresAdmin: true },
  { path: '/admin/users', name: 'Admin Users', requiresAdmin: true },
  { path: '/admin/providers', name: 'Admin Providers', requiresAdmin: true },
  { path: '/admin/services', name: 'Admin Services', requiresAdmin: true },
  { path: '/admin/cities', name: 'Admin Cities', requiresAdmin: true },
  { path: '/admin/city-services', name: 'Admin City Services', requiresAdmin: true },
  { path: '/admin/bookings', name: 'Admin Bookings', requiresAdmin: true },
  { path: '/admin/settings', name: 'Admin Settings', requiresAdmin: true },
  { path: '/admin/super-dashboard', name: 'Super Admin Dashboard', requiresAdmin: true },
  { path: '/admin/subscription-services', name: 'Admin Subscription Services', requiresAdmin: true },
  { path: '/admin/service-requests', name: 'Admin Service Requests', requiresAdmin: true },
  { path: '/admin/provider-analytics', name: 'Admin Provider Analytics', requiresAdmin: true },
  { path: '/admin/media-manager', name: 'Admin Media Manager', requiresAdmin: true },
  { path: '/admin/admin-users', name: 'Admin Users Management', requiresAdmin: true },
]

async function checkPage(page) {
  try {
    const response = await axios.get(`${BASE_URL}${page.path}`, {
      timeout: 10000,
      validateStatus: function (status) {
        // Accept 200, 302 (redirect), 401 (unauthorized), 403 (forbidden)
        return status < 500
      }
    })
    
    const status = response.status
    let result = 'UNKNOWN'
    
    if (status === 200) {
      result = 'OK'
    } else if (status === 302 || status === 307) {
      result = 'REDIRECT'
    } else if (status === 401) {
      result = page.requiresAuth || page.requiresAdmin ? 'AUTH_REQUIRED' : 'UNEXPECTED_AUTH'
    } else if (status === 403) {
      result = page.requiresAdmin ? 'ADMIN_REQUIRED' : 'FORBIDDEN'
    } else if (status === 404) {
      result = 'NOT_FOUND'
    } else {
      result = `HTTP_${status}`
    }
    
    return {
      ...page,
      status,
      result,
      success: status < 400 || (status === 401 && (page.requiresAuth || page.requiresAdmin)) || (status === 403 && page.requiresAdmin)
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      return {
        ...page,
        status: 'CONNECTION_REFUSED',
        result: 'SERVER_DOWN',
        success: false,
        error: 'Development server not running'
      }
    }
    
    return {
      ...page,
      status: 'ERROR',
      result: 'ERROR',
      success: false,
      error: error.message
    }
  }
}

async function checkAllPages() {
  console.log('🔍 Checking all pages...\n')
  console.log('Make sure the development server is running on http://localhost:3000\n')
  
  const results = []
  let passed = 0
  let failed = 0
  
  for (const page of pages) {
    const result = await checkPage(page)
    results.push(result)
    
    const icon = result.success ? '✅' : '❌'
    const authInfo = page.requiresAdmin ? ' [ADMIN]' : page.requiresAuth ? ' [AUTH]' : ''
    
    console.log(`${icon} ${page.name}${authInfo}`)
    console.log(`   Path: ${page.path}`)
    console.log(`   Status: ${result.status} (${result.result})`)
    
    if (result.error) {
      console.log(`   Error: ${result.error}`)
    }
    
    if (result.success) {
      passed++
    } else {
      failed++
    }
    
    console.log('')
  }
  
  console.log('📊 Summary:')
  console.log(`Total pages: ${results.length}`)
  console.log(`Passed: ${passed}`)
  console.log(`Failed: ${failed}`)
  
  // Group by result type
  const byResult = results.reduce((acc, result) => {
    acc[result.result] = (acc[result.result] || 0) + 1
    return acc
  }, {})
  
  console.log('\n📈 Results breakdown:')
  Object.entries(byResult).forEach(([result, count]) => {
    console.log(`${result}: ${count}`)
  })
  
  // Show failed pages
  const failedPages = results.filter(r => !r.success)
  if (failedPages.length > 0) {
    console.log('\n🚨 Failed pages:')
    failedPages.forEach(page => {
      console.log(`- ${page.name} (${page.path}): ${page.result}`)
      if (page.error) {
        console.log(`  Error: ${page.error}`)
      }
    })
  }
}

// Check if server is running first
async function checkServer() {
  try {
    await axios.get(BASE_URL, { timeout: 5000 })
    return true
  } catch (error) {
    console.log('❌ Development server is not running!')
    console.log('Please start the server with: npm run dev')
    console.log('Then run this script again.')
    return false
  }
}

async function main() {
  const serverRunning = await checkServer()
  if (serverRunning) {
    await checkAllPages()
  }
}

main().catch(console.error)