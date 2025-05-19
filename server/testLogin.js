// testLogin.js - Test script for login functionality
const fetch = require('node-fetch');

async function testLogin(endpoint, email, password) {
  try {
    console.log(`Testing login to ${endpoint} with email: ${email}`);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    return { success: response.ok, data };
  } catch (error) {
    console.error('Error during login test:', error);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  // Email and password for testing - using our newly created test user
  const testEmail = 'testuser@example.com';
  const testPassword = 'testpass123';
  
  console.log('=== TESTING LOGIN ENDPOINTS ===');
  
  // Test both endpoints
  console.log('\n1. Testing /api/auth/login endpoint:');
  await testLogin('http://localhost:5005/api/auth/login', testEmail, testPassword);
  
  console.log('\n2. Testing /routes/auth/login endpoint:');
  await testLogin('http://localhost:5005/routes/auth/login', testEmail, testPassword);
  
  console.log('\n=== TESTS COMPLETED ===');
}

runTests().catch(err => console.error('Test runner error:', err));
