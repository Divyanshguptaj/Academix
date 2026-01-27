import express from 'express';
const router = express.Router();

import {updateProfile, deleteAccount, getAllUsers,getUserDetails, getEnrolledCourses, instructorDetails, updateDisplayPicture, addCourseToUser, removeCourseFromUser, getCourseProgress, updateCourseProgress} from '../controllers/Profile.js'
import { 
  sanitizeInput, 
  handleValidationErrors,
  mongoSanitizeMiddleware,
  createRateLimit,
  validateProfileUpdate,
  validateCourseOperation
} from '../middlewares/inputSanitization.js'

// Rate limiting for profile endpoints
const profileRateLimit = createRateLimit(10, 15 * 60 * 1000); // 10 attempts per 15 minutes

router.post('/updateProfile', 
  profileRateLimit,
  sanitizeInput, 
  mongoSanitizeMiddleware, 
  validateProfileUpdate, 
  handleValidationErrors, 
  updateProfile
);

router.post('/deleteAccount', 
  profileRateLimit,
  sanitizeInput, 
  mongoSanitizeMiddleware, 
  deleteAccount
);

router.get('/getEnrolledCourses', 
  sanitizeInput, 
  mongoSanitizeMiddleware, 
  getEnrolledCourses
);

router.get('/getAllUsers', 
  sanitizeInput, 
  mongoSanitizeMiddleware, 
  getAllUsers
);

router.get('/getUserDetails', 
  sanitizeInput, 
  mongoSanitizeMiddleware, 
  getUserDetails
);

router.get('/instructorDashboard', 
  sanitizeInput, 
  mongoSanitizeMiddleware, 
  instructorDetails
);

router.put('/updateDisplayPicture', 
  profileRateLimit,
  sanitizeInput, 
  mongoSanitizeMiddleware, 
  updateDisplayPicture
);

// Course-related endpoints for Course Service communication
router.post('/add-course', 
  sanitizeInput, 
  mongoSanitizeMiddleware, 
  validateCourseOperation, 
  handleValidationErrors, 
  addCourseToUser
);

router.post('/remove-course', 
  sanitizeInput, 
  mongoSanitizeMiddleware, 
  validateCourseOperation, 
  handleValidationErrors, 
  removeCourseFromUser
);

router.get('/course-progress/:courseId/:userId', 
  sanitizeInput, 
  mongoSanitizeMiddleware, 
  getCourseProgress
);

router.post('/update-progress', 
  sanitizeInput, 
  mongoSanitizeMiddleware, 
  validateCourseOperation, 
  handleValidationErrors, 
  updateCourseProgress
);

export default router
