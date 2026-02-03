import express from 'express';
const router = express.Router();

import {updateProfile, deleteAccount, getAllUsers,getUserDetails, getEnrolledCourses, instructorDetails, updateDisplayPicture, addCourseToProfile, removeCourseFromProfile} from '../controllers/Profile.js'
import { sanitizeInput, handleValidationErrors, mongoSanitizeMiddleware, createRateLimit, validateProfileUpdate } from '../middlewares/inputSanitization.js'

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

router.post('/add-course', 
  profileRateLimit,
  sanitizeInput, 
  mongoSanitizeMiddleware, 
  addCourseToProfile
);

router.post('/remove-course', 
  profileRateLimit,
  sanitizeInput, 
  mongoSanitizeMiddleware, 
  removeCourseFromProfile
);

export default router
