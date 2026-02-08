import express from 'express'
import { authenticateAdmin } from '../middlewares/auth.js'
import * as adminController from '../controllers/Admin.js'

const router = express.Router()

// Admin Dashboard
router.get('/dashboard-stats', authenticateAdmin, adminController.getDashboardStats)

// User Management
router.get('/users', authenticateAdmin, adminController.getAllUsers)
router.put('/users/:id/status', authenticateAdmin, adminController.updateUserStatus)
router.get('/users/:id/details', authenticateAdmin, adminController.getUserDetails)

// Instructor Management
router.get('/instructors', authenticateAdmin, adminController.getAllInstructors)
router.put('/instructors/:id/approve', authenticateAdmin, adminController.approveInstructor)
router.put('/instructors/:id/revoke', authenticateAdmin, adminController.revokeInstructor)
router.get('/instructor-applications', authenticateAdmin, adminController.getInstructorApplications)

// Instructor Application Management
router.put('/instructor-applications/:id/approve', authenticateAdmin, adminController.approveInstructorApplication)
router.put('/instructor-applications/:id/reject', authenticateAdmin, adminController.rejectInstructorApplication)

export default router