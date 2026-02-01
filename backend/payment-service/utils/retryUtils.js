import axios from "axios";

// Environment-based configuration
const MAX_RETRIES = parseInt(process.env.MAX_RETRY_ATTEMPTS) || 3;
const BASE_DELAY = parseInt(process.env.RETRY_DELAY_BASE) || 1000;
const MAX_DELAY = parseInt(process.env.RETRY_DELAY_MAX) || 8000;

// Service URLs from environment variables
const SERVICE_URLS = {
  courseService: process.env.COURSE_SERVICE_URL || 'http://localhost:4002',
  userService: process.env.USER_SERVICE_URL || 'http://localhost:4001'
};

/**
 * Retry utility with exponential backoff and jitter
 * @param {Function} operation - The operation to retry
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise} - The result of the successful operation
 */
const withRetry = async (operation, maxRetries = MAX_RETRIES) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff with jitter
      const delay = Math.min(BASE_DELAY * Math.pow(2, attempt - 1), MAX_DELAY);
      const jitter = Math.random() * 1000; // Add randomness to prevent thundering herd
      const totalDelay = delay + jitter;
      
      console.log(`Retry attempt ${attempt}/${maxRetries} after ${Math.round(totalDelay)}ms for operation: ${error.message}`);
      
      await new Promise(resolve => setTimeout(resolve, totalDelay));
    }
  }
};

/**
 * Create axios instance with default timeout and retry configuration
 */
const createAxiosInstance = (baseURL, timeout = 10000) => {
  const instance = axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Add response interceptor for better error handling
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error(`HTTP Error: ${error.config.method?.toUpperCase()} ${error.config.url} - ${error.message}`);
      return Promise.reject(error);
    }
  );

  return instance;
};

// Pre-configured axios instances for each service
const courseService = createAxiosInstance(SERVICE_URLS.courseService);
const userService = createAxiosInstance(SERVICE_URLS.userService);

export { 
  withRetry, 
  SERVICE_URLS, 
  courseService, 
  userService,
  MAX_RETRIES,
  BASE_DELAY,
  MAX_DELAY
};