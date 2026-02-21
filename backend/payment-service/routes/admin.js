import express from 'express'
import { authorize } from '../../shared-utils/middlewares/auth.js'
import * as adminController from '../controllers/Admin.js'

const router = express.Router()

// Refund Management
router.get('/refunds', adminController.getRefundRequests)
router.put('/refunds/:id/process', authorize('Admin'), adminController.processRefund)
router.put('/refunds/:id/reject', authorize('Admin'), adminController.rejectRefund)
router.get('/refunds/analytics', adminController.getRefundAnalytics)

export default router