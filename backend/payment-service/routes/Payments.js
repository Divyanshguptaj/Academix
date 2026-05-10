import express from "express"
const router = express.Router()

import { capturePayment, verifyPayment, refundPayment, requestRefund, getMyRefunds } from '../controllers/Payments.js'
import { authorize } from '../../shared-utils/middlewares/auth.js'

// Initiate payment order - students only
router.post("/capturePayment", authorize('Student'), capturePayment);

// Verify payment signature and complete enrollment - students only
router.post("/verifyPayment", authorize('Student'), verifyPayment);

// Student refund requests
router.post("/request-refund", authorize('Student'), requestRefund);
router.get("/my-refunds", authorize('Student'), getMyRefunds);

export default router
