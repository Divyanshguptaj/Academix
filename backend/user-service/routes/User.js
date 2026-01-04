import express from 'express';
const router = express.Router();
import {login, signUp, changePassword, sendOTP} from '../controllers/Auth.js'
import {resetPasswordToken, resetPassword} from '../controllers/ResetPassword.js'

router.post('/login',login);
router.post('/signup',signUp);
router.post('/changepassword', changePassword);
router.post('/reset-password-token', resetPasswordToken)
router.post('/reset-password', resetPassword)
router.post('/sendotp', sendOTP);

export default router;
