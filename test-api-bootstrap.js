// Test the bootstrap API endpoint
const axios = require('axios')

async function testBootstrap() {
    try {
        console.log('Testing /api/catalog/bootstrap endpoint...\n')

        // First, try without auth to see the error
        try {
            const response = await axios.get('http://localhost:3000/api/catalog/bootstrap')
            console.log('Response (no auth):', response.data)
        } catch (error) {
            console.log('Expected error (no auth):', error.response?.status, error.response?.data)
        }

        console.log('\n---\n')
        console.log('To test with authentication, you need to:')
        console.log('1. Login via the UI')
        console.log('2. Get the access token from browser DevTools > Application > Local Storage')
        console.log('3. Add it to this script as Authorization: Bearer <token>')

    } catch (error) {
        console.error('Error:', error.message)
    }
}

testBootstrap()
