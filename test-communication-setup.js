// Test script to verify communication system setup
// Run with: node test-communication-setup.js

const testCommunicationSetup = async () => {
  try {
    console.log('🧪 Testing Communication System Setup...\n')
    
    // Test the migration API
    const response = await fetch('http://localhost:3000/api/migrations/setup-communication-system', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    
    const data = await response.json()
    
    console.log('📊 Migration Results:')
    console.log(`Status: ${response.status}`)
    console.log(`Success: ${data.success}`)
    console.log(`Message: ${data.message}`)
    
    if (data.stats) {
      console.log(`\n📈 Statistics:`)
      console.log(`Total statements: ${data.stats.total}`)
      console.log(`Successful: ${data.stats.successful}`)
      console.log(`Failed: ${data.stats.failed}`)
    }
    
    if (data.errors && data.errors.length > 0) {
      console.log(`\n❌ Errors:`)
      data.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`)
      })
    }
    
    if (data.nextSteps) {
      console.log(`\n📋 Next Steps:`)
      data.nextSteps.forEach((step, index) => {
        console.log(`${index + 1}. ${step}`)
      })
    }
    
    // Test the health check
    console.log('\n🔍 Testing Health Check...')
    const healthResponse = await fetch('http://localhost:3000/api/health/chat-tables')
    const healthData = await healthResponse.json()
    
    console.log(`Health Check Status: ${healthResponse.status}`)
    console.log(`Health Check Result:`, healthData)
    
  } catch (error) {
    console.error('💥 Test failed:', error.message)
  }
}

// Run the test
testCommunicationSetup()
