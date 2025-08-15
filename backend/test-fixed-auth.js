const fetch = require('node-fetch');

async function testFixedAuth() {
  const baseURL = 'http://localhost:3002/api/v1';
  
  try {
    console.log('Testing fixed authentication flow...');
    
    // Test login
    console.log('\n1. Testing login...');
    const loginResponse = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response status:', loginResponse.status);
    console.log('Login response:', JSON.stringify(loginData, null, 2));
    
    if (loginResponse.ok && loginData.data?.session?.access_token) {
      const token = loginData.data.session.access_token;
      console.log('\n✅ Login successful');
      console.log('Token received:', token.substring(0, 20) + '...');
      
      // Wait a moment to simulate frontend timing
      console.log('\n2. Waiting for token to be processed...');
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Test workspaces endpoint with token
      console.log('\n3. Testing workspaces endpoint...');
      const workspacesResponse = await fetch(`${baseURL}/workspaces`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      const workspacesData = await workspacesResponse.json();
      console.log('Workspaces response status:', workspacesResponse.status);
      console.log('Workspaces response:', JSON.stringify(workspacesData, null, 2));
      
      if (workspacesResponse.ok) {
        console.log('\n✅ Workspaces endpoint working correctly!');
      } else {
        console.log('\n❌ Workspaces endpoint still failing');
      }
      
    } else {
      console.log('\n❌ Login failed, cannot test workspaces endpoint');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testFixedAuth(); 