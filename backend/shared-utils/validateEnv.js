/**
 * Validates that all required environment variables are present at startup.
 * Exits the process immediately with a clear error message if any are missing.
 *
 * @param {string[]} requiredKeys - Array of env var names that must be set
 * @param {string} [serviceName] - Optional label shown in the error message
 *
 * Usage:
 *   import { validateEnv } from '../../shared-utils/validateEnv.js'
 *   validateEnv(['MONGODB_URL', 'JWT_SECRET'], 'user-service')
 */
export const validateEnv = (requiredKeys, serviceName = 'service') => {
  const missing = requiredKeys.filter(key => !process.env[key])

  if (missing.length > 0) {
    console.error(`\n[${serviceName}] Missing required environment variables:`)
    missing.forEach(key => console.error(`  - ${key}`))
    console.error('\nAdd these to your .env file and restart.\n')
    process.exit(1)
  }
}
