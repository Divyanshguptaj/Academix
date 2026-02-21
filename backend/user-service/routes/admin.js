import express from 'express'
import { authorize } from '../../shared-utils/middlewares/auth.js'
import * as adminController from '../controllers/Admin.js'

const router = express.Router()

// Admin Dashboard
router.get('/dashboard-stats', authorize('Admin'), adminController.getDashboardStats)

// User Management
router.get('/users', authorize('Admin'), adminController.getAllUsers)
router.put('/users/:id/status', authorize('Admin'), adminController.updateUserStatus)
router.get('/users/:id/details', authorize('Admin'), adminController.getUserDetails)

// Instructor Management
router.get('/instructors', authorize('Admin'), adminController.getAllInstructors)
router.put('/instructors/:id/approve', authorize('Admin'), adminController.approveInstructor)
router.put('/instructors/:id/revoke', authorize('Admin'), adminController.revokeInstructor)
router.get('/instructor-applications', authorize('Admin'), adminController.getInstructorApplications)

// Instructor Application Management
router.put('/instructor-applications/:id/approve', authorize('Admin'), adminController.approveInstructorApplication)
router.put('/instructor-applications/:id/reject', authorize('Admin'), adminController.rejectInstructorApplication)

export default router