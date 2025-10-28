// Test script for the registration API
// Run with: node test-api.js (or use curl commands from API_IMPLEMENTATION.md)

const API_URL = 'http://localhost:3000/api/register';

// Test 1: Valid registration
async function testValidRegistration() {
  console.log('\n🧪 Test 1: Valid Registration');
  console.log('================================');
  
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com'
    })
  });
  
  const data = await response.json();
  console.log('Status:', response.status);
  console.log('Response:', JSON.stringify(data, null, 2));
  console.log(response.ok ? '✅ SUCCESS' : '❌ FAILED');
}

// Test 2: Missing fields
async function testMissingFields() {
  console.log('\n🧪 Test 2: Missing Fields');
  console.log('================================');
  
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      firstName: 'Jane',
      // lastName is missing
      email: 'jane@example.com'
    })
  });
  
  const data = await response.json();
  console.log('Status:', response.status);
  console.log('Response:', JSON.stringify(data, null, 2));
  console.log(response.status === 400 ? '✅ VALIDATION WORKING' : '❌ FAILED');
}

// Test 3: Invalid email format
async function testInvalidEmail() {
  console.log('\n🧪 Test 3: Invalid Email Format');
  console.log('================================');
  
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'invalid-email'
    })
  });
  
  const data = await response.json();
  console.log('Status:', response.status);
  console.log('Response:', JSON.stringify(data, null, 2));
  console.log(response.status === 400 ? '✅ EMAIL VALIDATION WORKING' : '❌ FAILED');
}

// Test 4: GET endpoint (health check)
async function testHealthCheck() {
  console.log('\n🧪 Test 4: API Health Check');
  console.log('================================');
  
  const response = await fetch(API_URL, {
    method: 'GET'
  });
  
  const data = await response.json();
  console.log('Status:', response.status);
  console.log('Response:', JSON.stringify(data, null, 2));
  console.log(response.ok ? '✅ API IS RUNNING' : '❌ FAILED');
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting API Tests for BowlersNetwork Registration');
  console.log('====================================================');
  
  try {
    await testHealthCheck();
    await testValidRegistration();
    await testMissingFields();
    await testInvalidEmail();
    
    console.log('\n✨ All tests completed!');
    console.log('====================================================');
  } catch (error) {
    console.error('\n❌ Error running tests:', error.message);
  }
}

// Run tests if this script is executed directly
if (typeof window === 'undefined') {
  runAllTests();
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests, testValidRegistration, testMissingFields, testInvalidEmail, testHealthCheck };
}
