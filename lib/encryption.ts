import CryptoJS from "crypto-js"

// Master encryption key - in production, this should be from environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "SecureVault-Pro-2025-Msambwe-Master-Key-AES256"

/**
 * Encrypt a password using AES encryption (reversible)
 */
export function encryptPassword(password: string): string {
  try {
    const encrypted = CryptoJS.AES.encrypt(password, ENCRYPTION_KEY).toString()
    return encrypted
  } catch (error) {
    console.error("Password encryption failed:", error)
    throw new Error("Failed to encrypt password")
  }
}

/**
 * Decrypt a password using AES decryption
 */
export function decryptPassword(encryptedPassword: string): string {
  try {
    // Check if it's a bcrypt hash (starts with $2a$, $2b$, etc.)
    if (isBcryptHash(encryptedPassword)) {
      console.log("Cannot decrypt bcrypt hash - returning placeholder")
      return "[BCRYPT HASH - CANNOT DECRYPT]"
    }

    // Check if the string looks like it might be plain text (not encrypted)
    if (isLikelyPlainText(encryptedPassword)) {
      console.log("Password appears to be plain text - returning as is")
      return encryptedPassword
    }

    // Try to decrypt as AES
    const decrypted = CryptoJS.AES.decrypt(encryptedPassword, ENCRYPTION_KEY)
    const originalPassword = decrypted.toString(CryptoJS.enc.Utf8)

    if (!originalPassword || originalPassword.length === 0) {
      console.log("Decryption resulted in empty string - might be plain text or different encryption")
      return encryptedPassword // Return original if decryption fails
    }

    return originalPassword
  } catch (error) {
    console.error("Password decryption failed:", error)
    // If decryption fails, it might be plain text or a different format
    return encryptedPassword
  }
}

/**
 * Check if a string is likely plain text (not encrypted)
 */
export function isLikelyPlainText(str: string): boolean {
  // If it's too short to be encrypted, it's probably plain text
  if (str.length < 20) return true

  // If it contains common password characters and is readable, it's probably plain text
  const hasCommonChars = /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{}|;:,.<>?]+$/.test(str)
  const isReadable = !/[^\x20-\x7E]/.test(str) // Only printable ASCII

  return hasCommonChars && isReadable && str.length < 50
}

/**
 * Check if a string is a bcrypt hash
 */
export function isBcryptHash(str: string): boolean {
  // Bcrypt hashes start with $2a$, $2b$, $2x$, or $2y$ and are 60 characters long
  const bcryptRegex = /^\$2[abxy]\$\d+\$.{53}$/
  return bcryptRegex.test(str)
}

/**
 * Check if a string is encrypted with AES
 */
export function isAesEncrypted(str: string): boolean {
  try {
    // Try to decrypt - if it works, it's encrypted with AES
    const decrypted = CryptoJS.AES.decrypt(str, ENCRYPTION_KEY)
    const result = decrypted.toString(CryptoJS.enc.Utf8)
    return result.length > 0
  } catch {
    return false
  }
}

/**
 * Encrypt password only if it's not already encrypted
 */
export function encryptPasswordIfNeeded(password: string): string {
  if (isBcryptHash(password)) {
    // It's a bcrypt hash - we can't decrypt it, so return a placeholder
    console.log("Cannot re-encrypt bcrypt hash - returning as is")
    return password
  }

  if (isAesEncrypted(password)) {
    // Already AES encrypted, return as is
    return password
  }

  // Not encrypted, encrypt it with AES
  return encryptPassword(password)
}

/**
 * Generate a strong random password
 */
export function generateStrongPassword(length = 16): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const lowercase = "abcdefghijklmnopqrstuvwxyz"
  const numbers = "0123456789"
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?"

  const allChars = uppercase + lowercase + numbers + symbols
  let password = ""

  // Ensure at least one character from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]

  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("")
}
