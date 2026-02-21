import express from 'express';
const router = express.Router();
import {resetPasswordToken, resetPassword} from '../controllers/ResetPassword.js'
import { createRateLimit } from '../../shared-utils/middlewares/inputSanitization.js'

const resetRateLimit = createRateLimit(5, 15 * 60 * 1000);

router.post('/reset-password-token', resetRateLimit, resetPasswordToken)
router.post('/reset-password', resetRateLimit, resetPassword)

export default router;
