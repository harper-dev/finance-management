import 'dotenv/config'
import FinanceManagementApp from './app'
import { logger } from './config/logging'

const app = new FinanceManagementApp()

// Initialize the application
app.initialize().catch((error) => {
  logger.error('Failed to start application:', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    timestamp: new Date().toISOString()
  })
  process.exit(1)
})

export default app.getApp()