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
  mongoSanitizeMiddleware,
} from '../../shared-utils/middlewares/inputSanitization.js'


router.post('/login',
  sanitizeInput,
  mongoSanitizeMiddleware,
  validateLogin,
  login
);

router.post('/signup',
  sanitizeInput,
  mongoSanitizeMiddleware,
  validateSignup,
  signUp
);

router.post('/changepassword',
  sanitizeInput,
  mongoSanitizeMiddleware,
  validatePasswordChange,
  authenticateToken,
  changePassword
);

router.post('/reset-password-token',
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
  sanitizeInput,
  mongoSanitizeMiddleware,
  validateOTP,
  sendOTP
);

router.post('/google-auth',
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
