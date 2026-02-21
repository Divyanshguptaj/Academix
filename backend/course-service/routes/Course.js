import express from 'express';
const router = express.Router();
import { createCategory, findAllCategory, categoryPageDetails } from '../controllers/Category.js'
import {createCourse, showAllCourses, getCourseDetails, editCourse,getInstructorCourses, deleteCourse, getCourseDetailsForPayment, enrollStudentInCourse, getCourseByIds, getEnrolledStudentsWithProgress, updateCourseProgress, adminListCourses, approveCourse, rejectCourse, getCourseAnalytics} from '../controllers/Course.js'
import { authorize } from '../../shared-utils/middlewares/auth.js'
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
router.post('/createCategory',authorize('Admin'), createCategory)
router.get('/showAllCategories',findAllCategory);
router.post('/getCategoryPageDetails',categoryPageDetails);

// Admin - course management
// Support both REST-style and explicit routes so gateway/frontend variants work
router.get('/admin', authorize('Admin'), adminListCourses);
router.get('/admin/list', authorize('Admin'), adminListCourses);

// Approve/reject by body { courseId } or by URL param /admin/:id/approve
router.post('/admin/approve', authorize('Admin'), approveCourse);
router.post('/admin/reject', authorize('Admin'), rejectCourse);
router.post('/admin/:id/approve', authorize('Admin'), approveCourse);
router.post('/admin/:id/reject', authorize('Admin'), rejectCourse);

// Analytics: support /admin/analytics/:courseId and /admin/:id/analytics
router.get('/admin/analytics/:courseId', authorize('Admin'), getCourseAnalytics);
router.get('/admin/:id/analytics', authorize('Admin'), getCourseAnalytics);

//review and rating -
router.post('/createRating', authorize('Student'), createRating)
router.get('/getAverageRating',getAverageRating);
router.get('/getReviews',getAllReviews);

export default router
