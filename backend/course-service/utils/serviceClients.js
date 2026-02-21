import { createServiceClient } from '../../shared-utils/serviceClients.js'

// Calls user-service directly (bypasses API gateway)
export const userService = createServiceClient(
  process.env.USER_SERVICE_URL || 'http://localhost:4001'
)
