const express = require('express');
const router = express.Router();

const {updateProfile, deleteAccount, getAllUsers,getUserDetails, getEnrolledCourses, instructorDetails, updateDisplayPicture} = require('../controllers/Profile')

router.post('/updateProfile',updateProfile);
router.post('/deleteAccount',deleteAccount);
router.get('/getEnrolledCourses', getEnrolledCourses);
router.get('/getAllUsers', getAllUsers);
router.get('/getUserDetails', getUserDetails);
router.get('/instructorDashboard', instructorDetails);
router.put('/updateDisplayPicture', updateDisplayPicture);

module.exports = router