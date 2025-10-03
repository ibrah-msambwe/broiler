// Simple test script for batch login functionality
const testBatchLogin = async () => {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing Batch Login System...\n');
  
  // Test 1: API Health Check
  try {
    console.log('1. Testing API Health Check...');
    const response = await fetch(`${baseUrl}/api/test`);
    const data = await response.json();
    console.log(`   ✅ API is working: ${data.message}\n`);
  } catch (error) {
    console.log(`   ❌ API Health Check failed: ${error.message}\n`);
    return;
  }
  
  // Test 2: Mock Batch Login - Valid Credentials
  try {
    console.log('2. Testing Mock Batch Login (Valid Credentials)...');
    const response = await fetch(`${baseUrl}/api/test/mock-batch-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'test001', password: 'test123' })
    });
    const data = await response.json();
    
    if (response.ok && data.user) {
      console.log(`   ✅ Mock login successful: ${data.user.username} (${data.batch.name})\n`);
    } else {
      console.log(`   ❌ Mock login failed: ${data.error}\n`);
    }
  } catch (error) {
    console.log(`   ❌ Mock login test failed: ${error.message}\n`);
  }
  
  // Test 3: Mock Batch Login - Invalid Credentials
  try {
    console.log('3. Testing Mock Batch Login (Invalid Credentials)...');
    const response = await fetch(`${baseUrl}/api/test/mock-batch-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'invalid', password: 'invalid' })
    });
    
    if (!response.ok && response.status === 401) {
      console.log('   ✅ Invalid credentials properly rejected\n');
    } else {
      console.log('   ❌ Invalid credentials not properly rejected\n');
    }
  } catch (error) {
    console.log(`   ❌ Invalid credentials test failed: ${error.message}\n`);
  }
  
  // Test 4: Real Batch Login - Valid Credentials
  try {
    console.log('4. Testing Real Batch Login (Valid Credentials)...');
    const response = await fetch(`${baseUrl}/api/auth/batch-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'test001', password: 'test123' })
    });
    const data = await response.json();
    
    if (response.ok && data.user) {
      console.log(`   ✅ Real login successful: ${data.user.username} (${data.batch.name})\n`);
    } else {
      console.log(`   ❌ Real login failed: ${data.error}\n`);
    }
  } catch (error) {
    console.log(`   ❌ Real login test failed: ${error.message}\n`);
  }
  
  // Test 5: Real Batch Login - Invalid Credentials
  try {
    console.log('5. Testing Real Batch Login (Invalid Credentials)...');
    const response = await fetch(`${baseUrl}/api/auth/batch-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'invalid', password: 'invalid' })
    });
    
    if (!response.ok && response.status === 401) {
      console.log('   ✅ Invalid credentials properly rejected\n');
    } else {
      console.log('   ❌ Invalid credentials not properly rejected\n');
    }
  } catch (error) {
    console.log(`   ❌ Invalid credentials test failed: ${error.message}\n`);
  }
  
  console.log('🎉 Batch Login System Test Complete!');
  console.log('\n📋 Test Credentials:');
  console.log('   Mock Batch 1: test001 / test123');
  console.log('   Mock Batch 2: demo001 / demo123');
  console.log('\n🌐 Test the login form at: http://localhost:3000/batch-login');
  console.log('🧪 Run comprehensive tests at: http://localhost:3000/test-batch-login');
};

// Run the test
testBatchLogin().catch(console.error);

