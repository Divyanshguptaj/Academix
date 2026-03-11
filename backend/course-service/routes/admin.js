import express from 'express'
import { authorize } from '../../shared-utils/middlewares/auth.js'
import {
  adminListCourses,
  approveCourse,
  rejectCourse,
  getCourseAnalytics
} from '../controllers/Course.js'

const router = express.Router()

// List courses — hit via /admin/course/admin → gateway rewrites → /admin/admin → router sees /admin
router.get('/', authorize('Admin'), adminListCourses)
router.get('/list', authorize('Admin'), adminListCourses)
router.get('/admin', authorize('Admin'), adminListCourses)

// Approve / reject — hit via /admin/course/admin/approve → router sees /admin/approve
router.post('/approve', authorize('Admin'), approveCourse)
router.post('/reject', authorize('Admin'), rejectCourse)
router.post('/admin/approve', authorize('Admin'), approveCourse)
router.post('/admin/reject', authorize('Admin'), rejectCourse)
router.post('/:id/approve', authorize('Admin'), approveCourse)
router.post('/:id/reject', authorize('Admin'), rejectCourse)

// Analytics — hit via /admin/course/admin/analytics/:courseId → router sees /admin/analytics/:courseId
router.get('/analytics/:courseId', authorize('Admin'), getCourseAnalytics)
router.get('/admin/analytics/:courseId', authorize('Admin'), getCourseAnalytics)
router.get('/:id/analytics', authorize('Admin'), getCourseAnalytics)

export default router
