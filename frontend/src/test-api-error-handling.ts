// Test file to verify API error handling implementation
// This file can be run to test the enhanced error handling functionality

import { apiClient, NetworkError, ValidationError, AuthenticationError, OfflineError, TimeoutError } from './services/api'

// Test function to verify error handling works
export async function testApiErrorHandling() {
  console.log('Testing API Error Handling Implementation...')
  
  // Test 1: Check if client is online
  console.log('1. Online status:', apiClient.isClientOnline())
  
  // Test 2: Get retry configuration
  console.log('2. Retry config:', apiClient.getRetryConfig())
  
  // Test 3: Test connection (this will likely fail in test environment)
  try {
    const isConnected = await apiClient.testConnection()
    console.log('3. Connection test result:', isConnected)
  } catch (error) {
    console.log('3. Connection test failed (expected in test environment):', error instanceof Error ? error.message : error)
  }
  
  // Test 4: Verify error types are properly exported
  console.log('4. Error types available:')
  console.log('   - NetworkError:', typeof NetworkError === 'function')
  console.log('   - ValidationError:', typeof ValidationError === 'function')
  console.log('   - AuthenticationError:', typeof AuthenticationError === 'function')
  console.log('   - OfflineError:', typeof OfflineError === 'function')
  console.log('   - TimeoutError:', typeof TimeoutError === 'function')
  
  // Test 5: Create error instances to verify they work
  try {
    const networkError = new NetworkError('Test network error', 500, 'Internal Server Error', undefined, true)
    console.log('5. NetworkError created successfully:', networkError.message, 'isRetryable:', networkError.isRetryable)
    
    const validationError = new ValidationError('Test validation error', { field1: ['Error message'] })
    console.log('   ValidationError created successfully:', validationError.message)
    
    const authError = new AuthenticationError('Test auth error')
    console.log('   AuthenticationError created successfully:', authError.message)
    
    const offlineError = new OfflineError()
    console.log('   OfflineError created successfully:', offlineError.message)
    
    const timeoutError = new TimeoutError()
    console.log('   TimeoutError created successfully:', timeoutError.message)
    
  } catch (error) {
    console.error('5. Error creating error instances:', error)
  }
  
  console.log('API Error Handling test completed!')
}

// Export for potential use in other test files
export default testApiErrorHandling