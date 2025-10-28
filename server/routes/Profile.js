import express from 'express';
const router = express.Router();

import {updateProfile, deleteAccount, getAllUsers,getUserDetails, getEnrolledCourses, instructorDetails, updateDisplayPicture} from '../controllers/Profile.js'

router.post('/updateProfile',updateProfile);
router.post('/deleteAccount',deleteAccount);
router.get('/getEnrolledCourses', getEnrolledCourses);
router.get('/getAllUsers', getAllUsers);
router.get('/getUserDetails', getUserDetails);
router.get('/instructorDashboard', instructorDetails);
router.put('/updateDisplayPicture', updateDisplayPicture);

export default router
