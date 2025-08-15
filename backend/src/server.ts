import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { join } from 'path'
import app from './index'
import { logger } from './config/logging'

const port = parseInt(process.env.PORT || '3002')

logger.info(`🚀 Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
}) 