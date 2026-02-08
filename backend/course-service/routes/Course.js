import express from 'express';
const router = express.Router();
import { createCategory, findAllCategory, categoryPageDetails } from '../controllers/Category.js'
import {createCourse, showAllCourses, getCourseDetails, editCourse,getInstructorCourses, deleteCourse, getCourseDetailsForPayment, enrollStudentInCourse, getCourseByIds, getEnrolledStudentsWithProgress, updateCourseProgress} from '../controllers/Course.js'
import {auth, isAdmin, isStudent, isInstructor} from '../../shared-utils/middlewares/auth.js'
import {createSection, updateSection, deleteSection} from '../controllers/Section.js'
import {createSubSection,deleteSubSection, updateSubSection} from '../controllers/Subsection.js'
import {createRating, getAverageRating, getAllReviews} from '../controllers/RatingAndReview.js';

//course -
router.post('/editCourse', editCourse)
router.post('/createCourse', createCourse)
router.post('/deleteCourse', deleteCourse)
router.post('/updateCourseProgress', updateCourseProgress)
router.get('/showAllCoures', showAllCourses);
router.get('/getInstructorCourses', getInstructorCourses);
router.post('/getFullCourseDetails',getCourseDetails);

// Payment Service communication endpoints
router.get('/details/:courseId', getCourseDetailsForPayment);
router.post('/enroll', enrollStudentInCourse);

// User Service communication endpoint for enrolled courses
router.get('/get-courses-by-ids', getCourseByIds);

// Get enrolled students with progress for a course
router.get('/getEnrolledStudents/:courseId', getEnrolledStudentsWithProgress);

//section -
router.post('/createSection',createSection)
router.post('/updateSection',updateSection);
router.post('/deleteSection',deleteSection);

//sub-section -
router.post('/addSubSection',createSubSection)
router.post('/deleteSubSection', deleteSubSection)
router.post('/updateSubSection', updateSubSection)

//category -
router.post('/createCategory',auth ,isAdmin, createCategory)
router.get('/showAllCategories',findAllCategory);
router.post('/getCategoryPageDetails',categoryPageDetails);

//review and rating -
router.post('/createRating',/*auth , isStudent,*/ createRating)
router.get('/getAverageRating',getAverageRating);
router.get('/getReviews',getAllReviews);

export default router
