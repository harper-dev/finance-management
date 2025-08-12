import { Context, Next } from 'hono';
import { extendedLogger } from '../utils/logger';

export async function loggingMiddleware(c: Context, next: Next) {
  const startTime = Date.now();
  const method = c.req.method;
  const url = c.req.url;
  const userAgent = c.req.header('User-Agent');
  const ip = c.req.header('X-Forwarded-For') || c.req.header('X-Real-IP') || 'unknown';

  // Log request start
  extendedLogger.debug('Request started', {
    method,
    url,
    ip,
    userAgent,
    headers: Object.fromEntries(c.req.header())
  });

  try {
    // Continue to next middleware/route
    await next();
    
    // Calculate duration
    const duration = Date.now() - startTime;
    const statusCode = c.res.status;
    
    // Log successful request
    extendedLogger.logRequest(method, url, duration, statusCode, userAgent, ip);
    
    extendedLogger.debug('Request completed', {
      method,
      url,
      statusCode,
      duration: `${duration}ms`
    });
    
  } catch (error) {
    // Calculate duration
    const duration = Date.now() - startTime;
    const statusCode = c.res.status || 500;
    
    // Log error
    extendedLogger.error('Request failed', {
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Re-throw the error
    throw error;
  }
} 