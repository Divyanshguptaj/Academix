import express from 'express'
import { authenticateAdmin, authenticateToken } from '../middlewares/auth.js'
import * as adminController from '../controllers/Admin.js'

const router = express.Router()

// Admin Dashboard
router.get('/dashboard-stats', authenticateToken, authenticateAdmin, adminController.getDashboardStats)

// User Management
router.get('/users', authenticateToken, authenticateAdmin, adminController.getAllUsers)
router.put('/users/:id/status', authenticateToken, authenticateAdmin, adminController.updateUserStatus)
router.get('/users/:id/details', authenticateToken, authenticateAdmin, adminController.getUserDetails)

// Instructor Management
router.get('/instructors', authenticateToken, authenticateAdmin, adminController.getAllInstructors)
router.put('/instructors/:id/approve', authenticateToken, authenticateAdmin, adminController.approveInstructor)
router.put('/instructors/:id/revoke', authenticateToken, authenticateAdmin, adminController.revokeInstructor)
router.get('/instructor-applications', authenticateToken, authenticateAdmin, adminController.getInstructorApplications)

// Instructor Application Management
router.put('/instructor-applications/:id/approve', authenticateToken, authenticateAdmin, adminController.approveInstructorApplication)
router.put('/instructor-applications/:id/reject', authenticateToken, authenticateAdmin, adminController.rejectInstructorApplication)

export default router