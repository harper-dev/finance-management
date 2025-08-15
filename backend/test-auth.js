const fetch = require('node-fetch');

async function testAuth() {
  const baseURL = 'http://localhost:3002/api/v1';
  
  try {
    // Test login
    console.log('Testing login...');
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
      console.log('Token received:', token.substring(0, 20) + '...');
      
      // Test workspaces endpoint with token
      console.log('\nTesting workspaces endpoint...');
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
      
    } else {
      console.log('Login failed, cannot test workspaces endpoint');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAuth(); 