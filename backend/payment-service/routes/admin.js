import express from 'express'
import { authenticateAdmin } from '../middlewares/auth.js'
import * as adminController from '../controllers/Admin.js'

const router = express.Router()

// Refund Management
router.get('/refunds', adminController.getRefundRequests)
router.put('/refunds/:id/process', authenticateAdmin, adminController.processRefund)
router.put('/refunds/:id/reject', authenticateAdmin, adminController.rejectRefund)
router.get('/refunds/analytics', adminController.getRefundAnalytics)

export default router