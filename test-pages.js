const fs = require('fs')
const path = require('path')

// Get all JS files in pages directory
function getAllPages(dir, fileList = []) {
  const files = fs.readdirSync(dir)
  
  files.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    
    if (stat.isDirectory() && file !== 'api') {
      getAllPages(filePath, fileList)
    } else if (file.endsWith('.js') && !file.startsWith('_')) {
      fileList.push(filePath)
    }
  })
  
  return fileList
}

// Check for syntax errors
function checkSyntax(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    
    // Basic checks
    const issues = []
    
    // Check for missing imports
    if (content.includes('useState') && !content.includes('import { useState') && !content.includes('import React')) {
      issues.push('Missing useState import')
    }
    
    if (content.includes('useEffect') && !content.includes('import { useEffect') && !content.includes('import React')) {
      issues.push('Missing useEffect import')
    }
    
    if (content.includes('useRouter') && !content.includes('import { useRouter }')) {
      issues.push('Missing useRouter import')
    }
    
    // Check for export default
    if (!content.includes('export default')) {
      issues.push('Missing export default')
    }
    
    return { status: 'OK', issues }
  } catch (error) {
    return { status: 'ERROR', error: error.message }
  }
}

// Main test function
function testAllPages() {
  const pagesDir = path.join(__dirname, 'pages')
  const pages = getAllPages(pagesDir)
  
  console.log('🔍 Testing all pages...\n')
  
  const results = {
    total: pages.length,
    passed: 0,
    failed: 0,
    issues: []
  }
  
  pages.forEach(pagePath => {
    const relativePath = path.relative(__dirname, pagePath)
    const result = checkSyntax(pagePath)
    
    if (result.status === 'OK') {
      results.passed++
      if (result.issues.length > 0) {
        console.log(`⚠️  ${relativePath}`)
        result.issues.forEach(issue => console.log(`   - ${issue}`))
      } else {
        console.log(`✅ ${relativePath}`)
      }
    } else {
      results.failed++
      results.issues.push({ page: relativePath, error: result.error })
      console.log(`❌ ${relativePath}`)
      console.log(`   Error: ${result.error}`)
    }
  })
  
  console.log('\n📊 Summary:')
  console.log(`Total pages: ${results.total}`)
  console.log(`Passed: ${results.passed}`)
  console.log(`Failed: ${results.failed}`)
  
  if (results.issues.length > 0) {
    console.log('\n🚨 Critical Issues:')
    results.issues.forEach(issue => {
      console.log(`- ${issue.page}: ${issue.error}`)
    })
  }
}

testAllPages()