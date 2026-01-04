import express from 'express';
const router = express.Router();
import {resetPasswordToken, resetPassword} from '../controllers/ResetPassword.js'

router.post('/reset-password-token', resetPasswordToken)
router.post('/reset-password', resetPassword)

export default router;
