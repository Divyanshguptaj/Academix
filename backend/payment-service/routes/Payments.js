import express from "express"
const router = express.Router()

import { capturePayment, verifyPayment, refundPayment } from '../controllers/Payments.js'
import { auth, isInstructor, isStudent, isAdmin } from '../../shared-utils/middlewares/auth.js'

// Initiate payment order
router.post("/capturePayment", /*auth, isStudent,*/ capturePayment);

// Verify payment signature and complete enrollment
router.post("/verifyPayment", /*auth, isStudent,*/ verifyPayment);

// Manual refund for admin
router.post("/refund", /*auth, isAdmin,*/ refundPayment);

export default router
