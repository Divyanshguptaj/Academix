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

  // Inject the shared internal secret on every request.
  // Reading at request time (not at factory-call time) ensures dotenv has already run.
  instance.interceptors.request.use((config) => {
    const secret = process.env.INTERNAL_SERVICE_SECRET
    if (secret) {
      config.headers['x-service-secret'] = secret
    }
    return config
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
