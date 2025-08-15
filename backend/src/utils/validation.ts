export class ValidationUtils {
  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  static isValidCurrency(currency: string): boolean {
    const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY']
    return validCurrencies.includes(currency.toUpperCase())
  }

  static isValidAmount(amount: number): boolean {
    return typeof amount === 'number' && !isNaN(amount) && isFinite(amount) && amount >= 0
  }

  static isValidDate(date: Date): boolean {
    return date instanceof Date && !isNaN(date.getTime())
  }

  static validateStringLength(value: string, fieldName: string, minLength: number, maxLength: number): void {
    if (value.length < minLength || value.length > maxLength) {
      throw new Error(`${fieldName} must be between ${minLength} and ${maxLength} characters`)
    }
  }

  static validateEnum(value: string, fieldName: string, allowedValues: string[]): void {
    if (!allowedValues.includes(value)) {
      throw new Error(`${fieldName} must be one of: ${allowedValues.join(', ')}`)
    }
  }

  static validateRequiredFields(data: any, requiredFields: string[]): void {
    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        throw new Error(`Required field '${field}' is missing`)
      }
    }
  }
} 