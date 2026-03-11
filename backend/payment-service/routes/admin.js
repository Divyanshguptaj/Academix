import express from 'express'
import { authorize } from '../../shared-utils/middlewares/auth.js'
import * as adminController from '../controllers/Admin.js'

const router = express.Router()

// Manual refund - admin only
router.post("/refund", authorize('Admin'), refundPayment);
// Refund Management
router.get('/refunds', authorize('Admin'), adminController.getRefundRequests)
router.put('/refunds/:id/process', authorize('Admin'), adminController.processRefund)
router.put('/refunds/:id/reject', authorize('Admin'), adminController.rejectRefund)
router.get('/refunds/analytics', authorize('Admin'), adminController.getRefundAnalytics)

export default router