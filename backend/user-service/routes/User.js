import express from 'express';
const router = express.Router();
import {login, signUp, changePassword, sendOTP, getUserByEmail, googleAuth} from '../controllers/Auth.js'
import {resetPasswordToken, resetPassword} from '../controllers/ResetPassword.js'
import { invalidateToken } from '../middlewares/auth.js'

router.post('/login',login);
router.post('/signup',signUp);
router.post('/changepassword', changePassword);
router.post('/reset-password-token', resetPasswordToken)
router.post('/reset-password', resetPassword)
router.post('/sendotp', sendOTP);
router.post('/google-auth', googleAuth);
router.get('/user-by-email/:email', getUserByEmail);
router.post('/logout', invalidateToken);

export default router;
