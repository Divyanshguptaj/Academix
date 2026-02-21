// Re-exports from shared-utils — the actual implementation lives there.
export { withRetry, MAX_RETRIES, BASE_DELAY, MAX_DELAY } from '../../shared-utils/retryUtils.js'

import { createServiceClient } from '../../shared-utils/serviceClients.js'

// Calls each service directly (bypasses API gateway)
export const courseService = createServiceClient(
  process.env.COURSE_SERVICE_URL || 'http://localhost:4002'
)

export const userService = createServiceClient(
  process.env.USER_SERVICE_URL || 'http://localhost:4001'
)
