import express from 'express'
import { authorize, authorizeAdminOrInternal } from '../../shared-utils/middlewares/auth.js'
import {
  adminListCourses,
  approveCourse,
  rejectCourse,
  getCourseAnalytics
} from '../controllers/Course.js'

const router = express.Router()

// List — called by admin frontend AND user-service internally (dashboard/instructor stats)
router.get('/list', authorizeAdminOrInternal, adminListCourses)

// Approve / reject — admin frontend only
// /approve    → /api/v1/admin/course/approve   (gateway strips prefix)
// /:id/approve → /api/v1/admin/course/:id/approve
router.post('/approve', authorize('Admin'), approveCourse)
router.post('/:id/approve', authorize('Admin'), approveCourse)
router.post('/reject', authorize('Admin'), rejectCourse)
router.post('/:id/reject', authorize('Admin'), rejectCourse)

// Analytics — admin frontend only
// /analytics/:courseId  → /api/v1/admin/course/analytics/:courseId
// /:id/analytics        → /api/v1/admin/course/:id/analytics
router.get('/analytics/:courseId', authorize('Admin'), getCourseAnalytics)
router.get('/:id/analytics', authorize('Admin'), getCourseAnalytics)

export default router
