import express from 'express'
import { auth, isAdmin } from '../../shared-utils/middlewares/auth.js'
import {
  adminListCourses,
  approveCourse,
  rejectCourse,
  getCourseAnalytics
} from '../controllers/Course.js'

const router = express.Router()

// List courses (supports query params: status, page, limit, search)
router.get('/list', adminListCourses)
router.get('/', auth, isAdmin, adminListCourses)
router.get('/admin', adminListCourses) // Support /admin/admin path

// Approve / reject (support body { courseId } or URL param)
router.post('/approve', auth, isAdmin, approveCourse)
router.post('/reject', auth, isAdmin, rejectCourse)
router.post('/:id/approve', auth, isAdmin, approveCourse)
router.post('/:id/reject', auth, isAdmin, rejectCourse)

// Support for /admin/admin/approve and /admin/admin/reject paths
router.post('/admin/approve', auth, isAdmin, approveCourse)
router.post('/admin/reject', auth, isAdmin, rejectCourse)

// Analytics
router.get('/analytics/:courseId', auth, isAdmin, getCourseAnalytics)
router.get('/:id/analytics', auth, isAdmin, getCourseAnalytics)

// Support for /admin/admin/analytics path
router.get('/admin/analytics/:courseId', auth, isAdmin, getCourseAnalytics)

export default router
