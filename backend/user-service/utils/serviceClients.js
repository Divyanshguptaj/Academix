import { createServiceClient } from '../../shared-utils/serviceClients.js'

// Calls course-service directly (bypasses API gateway)
export const courseService = createServiceClient(
  process.env.COURSE_SERVICE_URL || 'http://localhost:4002'
)

// Calls payment-service directly (bypasses API gateway)
export const paymentService = createServiceClient(
  process.env.PAYMENT_SERVICE_URL || 'http://localhost:4003'
)
