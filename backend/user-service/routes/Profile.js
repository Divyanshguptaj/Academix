import express from 'express';
const router = express.Router();

import {updateProfile, deleteAccount, getAllUsers,getUserDetails, getEnrolledCourses, instructorDetails, updateDisplayPicture, addCourseToUser, removeCourseFromUser, getCourseProgress, updateCourseProgress} from '../controllers/Profile.js'

router.post('/updateProfile',updateProfile);
router.post('/deleteAccount',deleteAccount);
router.get('/getEnrolledCourses', getEnrolledCourses);
router.get('/getAllUsers', getAllUsers);
router.get('/getUserDetails', getUserDetails);
router.get('/instructorDashboard', instructorDetails);
router.put('/updateDisplayPicture', updateDisplayPicture);

// Course-related endpoints for Course Service communication
router.post('/add-course', addCourseToUser);
router.post('/remove-course', removeCourseFromUser);
router.get('/course-progress/:courseId/:userId', getCourseProgress);
router.post('/update-progress', updateCourseProgress);

export default router
