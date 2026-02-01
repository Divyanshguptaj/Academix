import express from "express"
const router = express.Router()

import { capturePayment, verifyPayment, sendPaymentSuccessEmail, manualRefund } from '../controllers/Payments.js'
import { auth, isInstructor, isStudent, isAdmin } from '../../shared-utils/middlewares/auth.js'

router.post("/capturePayment", /*auth,isStudent,*/  capturePayment)
router.post("/verifyPayment",/*auth, isStudent,*/  verifyPayment)
router.post("/sendPaymentSuccessEmail", /*auth, isStudent, */ sendPaymentSuccessEmail);
router.post("/refund", /*auth, isAdmin,*/ manualRefund);

export default router
