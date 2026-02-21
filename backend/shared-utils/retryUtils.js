/**
 * Retry utility with exponential backoff and jitter.
 * Moved to shared-utils so all services can use it for resilient inter-service calls.
 *
 * Usage:
 *   import { withRetry } from '../../shared-utils/retryUtils.js'
 *   const data = await withRetry(() => fetch('http://other-service/api'))
 */

const MAX_RETRIES = parseInt(process.env.MAX_RETRY_ATTEMPTS) || 3;
const BASE_DELAY = parseInt(process.env.RETRY_DELAY_BASE) || 1000;
const MAX_DELAY = parseInt(process.env.RETRY_DELAY_MAX) || 8000;

/**
 * Retries an async operation with exponential backoff + jitter.
 * @param {Function} operation - Async function to retry
 * @param {number} maxRetries - Max attempts (default: MAX_RETRY_ATTEMPTS env var or 3)
 * @returns {Promise} Result of the first successful call
 */
export const withRetry = async (operation, maxRetries = MAX_RETRIES) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff with jitter to prevent thundering herd
      const delay = Math.min(BASE_DELAY * Math.pow(2, attempt - 1), MAX_DELAY);
      const jitter = Math.random() * 1000;
      const totalDelay = delay + jitter;

      console.log(`Retry attempt ${attempt}/${maxRetries} after ${Math.round(totalDelay)}ms: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, totalDelay));
    }
  }
};

export { MAX_RETRIES, BASE_DELAY, MAX_DELAY };
