import express from 'express'
import { authorize, authorizeAdminOrInternal } from '../../shared-utils/middlewares/auth.js'
import * as adminController from '../controllers/Admin.js'

const router = express.Router()

// Static routes before parameterised ones to avoid `:id` swallowing them
router.get('/refunds', authorizeAdminOrInternal, adminController.getRefundRequests)
router.get('/refunds/analytics', authorizeAdminOrInternal, adminController.getRefundAnalytics)

// Per-refund mutations — admin only, never called internally
router.put('/refunds/:id/process', authorize('Admin'), adminController.processRefund)
router.put('/refunds/:id/reject', authorize('Admin'), adminController.rejectRefund)

export default router
