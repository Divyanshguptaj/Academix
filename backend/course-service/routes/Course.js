import express from 'express';
const router = express.Router();
import { createCategory, findAllCategory, categoryPageDetails } from '../controllers/Category.js'
import { createCourse, showAllCourses, getCourseDetails, getCoursePublicDetails, editCourse, getInstructorCourses, deleteCourse, getCourseDetailsForPayment, enrollStudentInCourse, getCourseByIds, getEnrolledStudentsWithProgress, updateCourseProgress } from '../controllers/Course.js'
import { authorize } from '../../shared-utils/middlewares/auth.js'
import { createSection, updateSection, deleteSection } from '../controllers/Section.js'
import { createSubSection, deleteSubSection, updateSubSection } from '../controllers/Subsection.js'
import { createRating, getAverageRating, getAllReviews } from '../controllers/RatingAndReview.js';

// Course — Instructor only
router.post('/createCourse', authorize('Instructor'), createCourse)
router.post('/editCourse', authorize('Instructor'), editCourse)
router.post('/deleteCourse', authorize('Instructor'), deleteCourse)
router.get('/getInstructorCourses', authorize('Instructor'), getInstructorCourses);

// Course — Public
router.get('/showAllCoures', showAllCourses);
router.post('/getCoursePublicDetails', getCoursePublicDetails);

// Course — Authenticated (enrolled student, instructor, or admin)
router.post('/getFullCourseDetails', authorize('Student', 'Instructor', 'Admin'), getCourseDetails);
router.post('/updateCourseProgress', authorize('Student'), updateCourseProgress)

// Section — Instructor only
router.post('/createSection', authorize('Instructor'), createSection)
router.post('/updateSection', authorize('Instructor'), updateSection);
router.post('/deleteSection', authorize('Instructor'), deleteSection);

// Sub-section — Instructor only
router.post('/addSubSection', authorize('Instructor'), createSubSection)
router.post('/updateSubSection', authorize('Instructor'), updateSubSection)
router.post('/deleteSubSection', authorize('Instructor'), deleteSubSection)

// Category — public reads, Admin-only writes
router.post('/createCategory', authorize('Admin'), createCategory)
router.get('/showAllCategories', findAllCategory);
router.post('/getCategoryPageDetails', categoryPageDetails);

// Rating & Reviews — public reads, Student-only writes
router.post('/createRating', authorize('Student'), createRating)
router.get('/getAverageRating', getAverageRating);
router.get('/getReviews', getAllReviews);

// Internal service-to-service endpoints (called by payment-service / user-service, no user auth)
router.get('/details/:courseId', getCourseDetailsForPayment);
router.post('/enroll', enrollStudentInCourse);
router.get('/get-courses-by-ids', getCourseByIds);
router.get('/getEnrolledStudents/:courseId', getEnrolledStudentsWithProgress);

export default router
