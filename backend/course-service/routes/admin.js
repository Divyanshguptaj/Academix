import express from 'express'
import { authorize } from '../../shared-utils/middlewares/auth.js'
import {
  adminListCourses,
  approveCourse,
  rejectCourse,
  getCourseAnalytics
} from '../controllers/Course.js'

const router = express.Router()

// List courses (supports query params: status, page, limit, search)
router.get('/list', adminListCourses)
router.get('/', authorize('Admin'), adminListCourses)
router.get('/admin', adminListCourses) // Support /admin/admin path

// Approve / reject (support body { courseId } or URL param)
router.post('/approve', authorize('Admin'), approveCourse)
router.post('/reject', authorize('Admin'), rejectCourse)
router.post('/:id/approve', authorize('Admin'), approveCourse)
router.post('/:id/reject', authorize('Admin'), rejectCourse)

// Support for /admin/admin/approve and /admin/admin/reject paths
router.post('/admin/approve', authorize('Admin'), approveCourse)
router.post('/admin/reject', authorize('Admin'), rejectCourse)

// Analytics
router.get('/analytics/:courseId', authorize('Admin'), getCourseAnalytics)
router.get('/:id/analytics', authorize('Admin'), getCourseAnalytics)

// Support for /admin/admin/analytics path
router.get('/admin/analytics/:courseId', authorize('Admin'), getCourseAnalytics)

export default router
