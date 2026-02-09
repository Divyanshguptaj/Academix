import express from 'express';
const router = express.Router();

import {updateProfile, deleteAccount, getAllUsers,getUserDetails, getEnrolledCourses, instructorDetails, updateDisplayPicture, addCourseToProfile, removeCourseFromProfile, addCourseProgressToProfile, removeCourseProgressFromProfile} from '../controllers/Profile.js'
import { authenticateToken, authenticateAdmin, authenticateInstructor } from '../middlewares/auth.js'
import { sanitizeInput, handleValidationErrors, mongoSanitizeMiddleware, createRateLimit, validateProfileUpdate } from '../middlewares/inputSanitization.js'

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
  authenticateAdmin,  // Admin only
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
  authenticateInstructor,  // Instructor only
  instructorDetails
);

router.put('/updateDisplayPicture', 
  profileRateLimit,
  sanitizeInput, 
  mongoSanitizeMiddleware, 
  authenticateToken,  // Add authentication middleware
  updateDisplayPicture
);

router.post('/add-course', 
  profileRateLimit,
  sanitizeInput, 
  mongoSanitizeMiddleware, 
  authenticateToken,  // Add authentication middleware
  addCourseToProfile
);

router.post('/remove-course', 
  profileRateLimit,
  sanitizeInput, 
  mongoSanitizeMiddleware, 
  authenticateToken,  // Add authentication middleware
  removeCourseFromProfile
);

router.post('/add-course-progress',
  profileRateLimit,
  sanitizeInput,
  mongoSanitizeMiddleware,
  authenticateToken,  // Add authentication middleware
  addCourseProgressToProfile
);

router.post('/remove-course-progress',
  profileRateLimit,
  sanitizeInput,
  mongoSanitizeMiddleware,
  authenticateToken,  // Add authentication middleware
  removeCourseProgressFromProfile
);

export default router
