/**
 * Input sanitization utilities for security
 */

/**
 * Sanitize a string input by removing potentially dangerous characters
 * and normalizing whitespace
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return input
  }

  return input
    // Remove null bytes
    .replace(/\0/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Trim leading/trailing whitespace
    .trim()
    // Remove control characters except newlines and tabs
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Limit length to prevent DoS
    .substring(0, 10000)
}

/**
 * Sanitize HTML content by removing script tags and dangerous attributes
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') {
    return input
  }

  return input
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove javascript: URLs
    .replace(/javascript:/gi, '')
    // Remove on* event handlers
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
    // Remove data: URLs (except images)
    .replace(/data:(?!image\/)/gi, 'data-blocked:')
    // Apply basic sanitization
    .replace(/\0/g, '')
    .trim()
}

/**
 * Sanitize an object recursively, applying appropriate sanitization
 * to string values based on field names
 */
export function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (typeof obj === 'string') {
    return sanitizeInput(obj)
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item))
  }

  if (typeof obj === 'object') {
    const sanitized: any = {}
    
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = sanitizeInput(key)
      
      if (typeof value === 'string') {
        // Apply different sanitization based on field type
        if (isHtmlField(sanitizedKey)) {
          sanitized[sanitizedKey] = sanitizeHtml(value)
        } else if (isEmailField(sanitizedKey)) {
          sanitized[sanitizedKey] = sanitizeEmail(value)
        } else if (isUrlField(sanitizedKey)) {
          sanitized[sanitizedKey] = sanitizeUrl(value)
        } else {
          sanitized[sanitizedKey] = sanitizeInput(value)
        }
      } else {
        sanitized[sanitizedKey] = sanitizeObject(value)
      }
    }
    
    return sanitized
  }

  return obj
}

/**
 * Sanitize email addresses
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') {
    return email
  }

  return email
    .toLowerCase()
    .trim()
    .replace(/\s/g, '')
    .substring(0, 254) // RFC 5321 limit
}

/**
 * Sanitize URLs
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') {
    return url
  }

  const sanitized = url.trim().substring(0, 2048) // Reasonable URL length limit

  // Only allow http, https, and mailto protocols
  if (sanitized.match(/^https?:\/\//i) || sanitized.match(/^mailto:/i)) {
    return sanitized
  }

  // If no protocol, assume https
  if (sanitized.match(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)) {
    return `https://${sanitized}`
  }

  // Block potentially dangerous URLs
  return ''
}

/**
 * Check if a field name suggests it contains HTML content
 */
function isHtmlField(fieldName: string): boolean {
  const htmlFields = ['description', 'content', 'body', 'message', 'notes', 'comment']
  return htmlFields.some(field => fieldName.toLowerCase().includes(field))
}

/**
 * Check if a field name suggests it contains an email
 */
function isEmailField(fieldName: string): boolean {
  const emailFields = ['email', 'mail']
  return emailFields.some(field => fieldName.toLowerCase().includes(field))
}

/**
 * Check if a field name suggests it contains a URL
 */
function isUrlField(fieldName: string): boolean {
  const urlFields = ['url', 'link', 'href', 'website', 'homepage']
  return urlFields.some(field => fieldName.toLowerCase().includes(field))
}

/**
 * Sanitize SQL-like input to prevent injection attempts
 * Note: This is a basic sanitization - proper parameterized queries should always be used
 */
export function sanitizeSqlInput(input: string): string {
  if (typeof input !== 'string') {
    return input
  }

  return input
    // Remove SQL comment markers
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    // Remove common SQL injection patterns
    .replace(/;\s*(drop|delete|insert|update|create|alter|exec|execute)\s/gi, '; blocked-')
    // Apply basic sanitization
    .replace(/\0/g, '')
    .trim()
}

/**
 * Validate and sanitize file names
 */
export function sanitizeFileName(fileName: string): string {
  if (typeof fileName !== 'string') {
    return fileName
  }

  return fileName
    // Remove path traversal attempts
    .replace(/\.\./g, '')
    .replace(/[\/\\]/g, '')
    // Remove potentially dangerous characters
    .replace(/[<>:"|?*\x00-\x1f]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim()
    // Limit length
    .substring(0, 255)
}

/**
 * Sanitize numeric input to prevent overflow attacks
 */
export function sanitizeNumericInput(input: any): number | null {
  if (typeof input === 'number') {
    // Check for valid finite number
    if (!Number.isFinite(input)) {
      return null
    }
    
    // Prevent extremely large numbers that could cause issues
    if (Math.abs(input) > Number.MAX_SAFE_INTEGER) {
      return null
    }
    
    return input
  }

  if (typeof input === 'string') {
    const parsed = parseFloat(input)
    return sanitizeNumericInput(parsed)
  }

  return null
}