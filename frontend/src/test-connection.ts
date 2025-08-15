// Simple test to verify API connection
export async function testApiConnection() {
  try {
    console.log('Testing API connection...')
    console.log('navigator.onLine:', navigator.onLine)
    
    const response = await fetch('http://localhost:3002/api/v1/workspaces', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    console.log('Response status:', response.status)
    console.log('Response headers:', response.headers)
    
    const data = await response.text()
    console.log('Response data:', data)
    
    return { success: true, status: response.status, data }
  } catch (error) {
    console.error('API connection test failed:', error)
    return { success: false, error: error.message }
  }
}

// Test CORS
export async function testCors() {
  try {
    console.log('Testing CORS...')
    
    const response = await fetch('http://localhost:3002/api/v1/workspaces', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3001',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    })
    
    console.log('CORS Response status:', response.status)
    console.log('CORS Response headers:', response.headers)
    
    return { success: true, status: response.status }
  } catch (error) {
    console.error('CORS test failed:', error)
    return { success: false, error: error.message }
  }
} 