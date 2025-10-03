// Common validation utilities for API routes

export interface ValidationError {
  error: string
  details?: any
  help?: string
}

export function validateRequestBody(body: any): ValidationError | null {
  if (!body || typeof body !== 'object') {
    return {
      error: "Invalid request format. Please provide valid JSON data.",
      help: "Ensure your request body is valid JSON"
    }
  }
  return null
}

export function validateRequiredFields(body: any, requiredFields: string[]): ValidationError | null {
  const missing = requiredFields.filter(field => !body[field])
  
  if (missing.length > 0) {
    return {
      error: `Missing required fields: ${missing.join(', ')}`,
      details: { missing },
      help: `Please provide: ${missing.join(', ')}`
    }
  }
  return null
}

export function validateFieldTypes(body: any, fieldTypes: Record<string, string>): ValidationError | null {
  const invalid: string[] = []
  
  for (const [field, expectedType] of Object.entries(fieldTypes)) {
    if (body[field] !== undefined && typeof body[field] !== expectedType) {
      invalid.push(`${field} (expected ${expectedType}, got ${typeof body[field]})`)
    }
  }
  
  if (invalid.length > 0) {
    return {
      error: `Invalid field types: ${invalid.join(', ')}`,
      details: { invalid }
    }
  }
  return null
}

export function validateNonEmptyStrings(body: any, fields: string[]): ValidationError | null {
  const empty: string[] = []
  
  for (const field of fields) {
    if (body[field] !== undefined && typeof body[field] === 'string' && body[field].trim().length === 0) {
      empty.push(field)
    }
  }
  
  if (empty.length > 0) {
    return {
      error: `Empty values not allowed: ${empty.join(', ')}`,
      details: { empty }
    }
  }
  return null
}

export function validateQueryParams(searchParams: URLSearchParams, requiredParams: string[]): ValidationError | null {
  const missing = requiredParams.filter(param => !searchParams.get(param))
  
  if (missing.length > 0) {
    return {
      error: `Missing required query parameters: ${missing.join(', ')}`,
      details: { missing },
      help: `Add ${missing.map(p => `?${p}=value`).join('&')} to the URL`
    }
  }
  return null
}

export function handleApiError(error: any): { error: string; status: number } {
  console.error("API Error:", error)
  
  // Handle JSON parsing errors
  if (error instanceof SyntaxError) {
    return {
      error: "Invalid JSON format in request body",
      status: 400
    }
  }
  
  // Handle other known errors
  if (error?.message?.includes('validation')) {
    return {
      error: error.message,
      status: 400
    }
  }
  
  // Default to 500 for unknown errors
  return {
    error: "Internal server error. Please try again later.",
    status: 500
  }
}
