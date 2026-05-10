import express from 'express';
const router = express.Router();
import {login, signUp, changePassword, sendOTP, getUserByEmail, googleAuth, getInstructorsByIds, getUsersByIds, submitInstructorApplication, getMyInstructorApplication} from '../controllers/Auth.js'
import {resetPasswordToken, resetPassword} from '../controllers/ResetPassword.js'
import { invalidateToken, authenticateToken, authenticateInternal } from '../../shared-utils/middlewares/auth.js'
import {
  sanitizeInput,
  validateSignup,
  validateLogin,
  validatePasswordChange,
  validateOTP,
  validatePasswordReset,
  validatePasswordResetConfirm,
  handleValidationErrors,
  mongoSanitizeMiddleware,
  createRateLimit
} from '../../shared-utils/middlewares/inputSanitization.js'

// Rate limiting for auth endpoints
const authRateLimit = createRateLimit(10, 15 * 60 * 1000); // 5 attempts per 15 minutes
const applicationRateLimit = createRateLimit(10, 60 * 60 * 1000); // 10 attempts per hour

router.post('/login', 
  authRateLimit,
  sanitizeInput, 
  mongoSanitizeMiddleware, 
  validateLogin, 
  login
);

router.post('/signup', 
  authRateLimit,
  sanitizeInput, 
  mongoSanitizeMiddleware, 
  validateSignup, 
  signUp
);

router.post('/changepassword', 
  authRateLimit,
  sanitizeInput, 
  mongoSanitizeMiddleware, 
  validatePasswordChange, 
  authenticateToken,  // Add authentication middleware
  changePassword
);

router.post('/reset-password-token', 
  authRateLimit,
  sanitizeInput, 
  mongoSanitizeMiddleware, 
  validatePasswordReset, 
  resetPasswordToken
);

router.post('/reset-password', 
  sanitizeInput, 
  mongoSanitizeMiddleware, 
  validatePasswordResetConfirm, 
  resetPassword
);

router.post('/sendotp', 
  authRateLimit,
  sanitizeInput, 
  mongoSanitizeMiddleware, 
  validateOTP, 
  sendOTP
);

router.post('/google-auth',
  authRateLimit,
  sanitizeInput,
  mongoSanitizeMiddleware,
  googleAuth
);

// Internal-only: called by course-service, never by end users
router.get('/user-by-email/:email', sanitizeInput, mongoSanitizeMiddleware, authenticateInternal, getUserByEmail);
router.get('/get-instructors-by-ids', sanitizeInput, mongoSanitizeMiddleware, authenticateInternal, getInstructorsByIds);
router.get('/get-users-by-ids', sanitizeInput, mongoSanitizeMiddleware, authenticateInternal, getUsersByIds);

router.post('/logout', 
  authenticateToken,  // Add authentication middleware
  invalidateToken
);

// Instructor Application Routes
router.post('/submit-instructor-application',
  applicationRateLimit,
  sanitizeInput,
  mongoSanitizeMiddleware,
  authenticateToken,
  submitInstructorApplication
);

router.get('/my-instructor-application',
  authenticateToken,
  getMyInstructorApplication
);

export default router;
