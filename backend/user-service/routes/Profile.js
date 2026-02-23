import express from 'express';
const router = express.Router();

import {updateProfile, deleteAccount, getAllUsers,getUserDetails, getEnrolledCourses, instructorDetails, updateDisplayPicture, addCourseToProfile, removeCourseFromProfile, addCourseProgressToProfile, removeCourseProgressFromProfile} from '../controllers/Profile.js'
import { authenticateToken, authorize, authenticateInternal } from '../../shared-utils/middlewares/auth.js'
import { sanitizeInput, handleValidationErrors, mongoSanitizeMiddleware, createRateLimit, validateProfileUpdate } from '../../shared-utils/middlewares/inputSanitization.js'

// Rate limiting for profile endpoints
const profileRateLimit = createRateLimit(10, 15 * 60 * 1000); // 10 attempts per 15 minutes

router.post('/updateProfile', 
  profileRateLimit,
  sanitizeInput, 
  mongoSanitizeMiddleware, 
  validateProfileUpdate, 
  handleValidationErrors, 
  authenticateToken,  // Add authentication middleware
  updateProfile
);

router.post('/deleteAccount', 
  profileRateLimit,
  sanitizeInput, 
  mongoSanitizeMiddleware, 
  authenticateToken,  // Add authentication middleware
  deleteAccount
);

router.get('/getEnrolledCourses', 
  sanitizeInput, 
  mongoSanitizeMiddleware, 
  authenticateToken,  // Add authentication middleware
  getEnrolledCourses
);

router.get('/getAllUsers', 
  sanitizeInput, 
  mongoSanitizeMiddleware, 
  authorize('Admin'),
  getAllUsers
);

router.get('/getUserDetails', 
  sanitizeInput, 
  mongoSanitizeMiddleware, 
  authenticateToken,  // Add authentication middleware
  getUserDetails
);

router.get('/instructorDashboard', 
  sanitizeInput, 
  mongoSanitizeMiddleware, 
  authorize('Instructor', 'Admin'),
  instructorDetails
);

router.put('/updateDisplayPicture', 
  profileRateLimit,
  sanitizeInput, 
  mongoSanitizeMiddleware, 
  authenticateToken,  // Add authentication middleware
  updateDisplayPicture
);

// Internal-only: called by course-service and payment-service, never by end users.
// Protected by shared service secret instead of user JWT.
router.post('/add-course', authenticateInternal, addCourseToProfile);
router.post('/remove-course', authenticateInternal, removeCourseFromProfile);
router.post('/add-course-progress', authenticateInternal, addCourseProgressToProfile);
router.post('/remove-course-progress', authenticateInternal, removeCourseProgressFromProfile);

export default router
