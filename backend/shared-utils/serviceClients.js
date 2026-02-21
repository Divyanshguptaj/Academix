import axios from 'axios'

/**
 * Creates a pre-configured axios instance for inter-service HTTP calls.
 * All inter-service clients should be created with this factory so they
 * share the same timeout, headers, and error-logging interceptor.
 *
 * @param {string} baseUrl  - Base URL of the target service (e.g. 'http://localhost:4001')
 * @param {number} timeout  - Request timeout in ms (default 10 000)
 */
export const createServiceClient = (baseUrl, timeout = 10000) => {
  const instance = axios.create({
    baseURL: baseUrl,
    timeout,
    headers: { 'Content-Type': 'application/json' },
  })

  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      const method = err.config?.method?.toUpperCase() ?? '?'
      const url    = err.config?.url ?? '?'
      console.error(`[service-client] ${method} ${url} — ${err.message}`)
      return Promise.reject(err)
    }
  )

  return instance
}
