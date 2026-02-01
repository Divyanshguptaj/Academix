import express from 'express';
const router = express.Router();
import {login, signUp, changePassword, sendOTP, getUserByEmail, googleAuth, getInstructorsByIds} from '../controllers/Auth.js'
import {resetPasswordToken, resetPassword} from '../controllers/ResetPassword.js'
import { invalidateToken } from '../middlewares/auth.js'
import { 
  sanitizeInput, 
  validateSignup, 
  validateLogin, 
  validatePasswordChange, 
  validateOTP, 
  validateGoogleAuth, 
  validatePasswordReset, 
  validatePasswordResetConfirm,
  handleValidationErrors,
  mongoSanitizeMiddleware,
  createRateLimit
} from '../middlewares/inputSanitization.js'

// Rate limiting for auth endpoints
const authRateLimit = createRateLimit(5, 15 * 60 * 1000); // 5 attempts per 15 minutes

router.post('/login', 
  authRateLimit,
  sanitizeInput, 
  mongoSanitizeMiddleware, 
  validateLogin, 
  handleValidationErrors, 
  login
);

router.post('/signup', 
  authRateLimit,
  sanitizeInput, 
  mongoSanitizeMiddleware, 
  validateSignup, 
  handleValidationErrors, 
  signUp
);

router.post('/changepassword', 
  authRateLimit,
  sanitizeInput, 
  mongoSanitizeMiddleware, 
  validatePasswordChange, 
  handleValidationErrors, 
  changePassword
);

router.post('/reset-password-token', 
  authRateLimit,
  sanitizeInput, 
  mongoSanitizeMiddleware, 
  validatePasswordReset, 
  handleValidationErrors, 
  resetPasswordToken
);

router.post('/reset-password', 
  sanitizeInput, 
  mongoSanitizeMiddleware, 
  validatePasswordResetConfirm, 
  handleValidationErrors, 
  resetPassword
);

router.post('/sendotp', 
  authRateLimit,
  sanitizeInput, 
  mongoSanitizeMiddleware, 
  validateOTP, 
  handleValidationErrors, 
  sendOTP
);

router.post('/google-auth', 
  sanitizeInput, 
  mongoSanitizeMiddleware, 
  validateGoogleAuth, 
  handleValidationErrors, 
  googleAuth
);

router.get('/user-by-email/:email', 
  sanitizeInput, 
  mongoSanitizeMiddleware, 
  getUserByEmail
);

router.get('/get-instructors-by-ids', 
  sanitizeInput, 
  mongoSanitizeMiddleware, 
  getInstructorsByIds
);

router.post('/logout', invalidateToken);

export default router;
