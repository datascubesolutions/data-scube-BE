const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testAPI() {
  console.log('🚀 Testing DataScube API...\n');

  try {
    // Test health check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data.data.message);

    // Test inquiry creation
    console.log('\n2. Testing inquiry creation...');
    const inquiryData = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+1234567890',
      company: 'Test Company',
      subject: 'API Test Inquiry',
      message: 'This is a test inquiry created via the API to verify functionality.',
      inquiryType: 'general',
      priority: 'medium',
      source: 'api',
    };

    const createResponse = await axios.post(`${BASE_URL}/inquiries`, inquiryData);
    console.log('✅ Inquiry created successfully:', createResponse.data.data.id);
    const inquiryId = createResponse.data.data.id;

    // Test inquiry retrieval
    console.log('\n3. Testing inquiry retrieval...');
    const getResponse = await axios.get(`${BASE_URL}/inquiries/${inquiryId}`);
    console.log('✅ Inquiry retrieved:', getResponse.data.data.name);

    // Test inquiry list
    console.log('\n4. Testing inquiry list...');
    const listResponse = await axios.get(`${BASE_URL}/inquiries?limit=5`);
    console.log('✅ Inquiry list retrieved:', listResponse.data.data.length, 'items');

    // Test inquiry update
    console.log('\n5. Testing inquiry update...');
    const updateResponse = await axios.put(`${BASE_URL}/inquiries/${inquiryId}`, {
      status: 'in-progress',
      priority: 'high',
    });
    console.log('✅ Inquiry updated:', updateResponse.data.data.status);

    // Test inquiry stats
    console.log('\n6. Testing inquiry statistics...');
    const statsResponse = await axios.get(`${BASE_URL}/inquiries/stats`);
    console.log('✅ Stats retrieved:', statsResponse.data.data.overview.total, 'total inquiries');

    console.log('\n🎉 All API tests passed successfully!');
  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run tests
testAPI();
