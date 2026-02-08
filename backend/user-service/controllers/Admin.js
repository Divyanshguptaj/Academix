import User from '../models/User.js'
import InstructorApplication from '../models/InstructorApplication.js'
import Profile from '../models/Profile.js'
import mongoose from 'mongoose'

// Admin Dashboard Stats
export const getDashboardStats = async (req, res) => {
  try {
    const stats = {
      totalUsers: await User.countDocuments(),
      studentCount: await User.countDocuments({ accountType: 'Student' }),
      instructorCount: await User.countDocuments({ accountType: 'Instructor' }),
      adminCount: await User.countDocuments({ accountType: 'Admin' }),
      totalCourses: 0, // This will be populated by course service
      publishedCourses: 0,
      draftCourses: 0,
      pendingActions: 0,
      pendingInstructorApplications: await InstructorApplication.countDocuments({ status: 'pending' }),
      pendingCourseApprovals: 0, // This will be populated by course service
      pendingRefundRequests: 0, // This will be populated by payment service
      recentActivity: [], // This will be populated by activity logs
      totalRevenue: 0, // This will be populated by payment service
      monthlyRevenue: 0, // This will be populated by payment service
      pendingRevenue: 0 // This will be populated by payment service
    }

    res.status(200).json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats'
    })
  }
}

// User Management
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate('additionalDetails')
      .select('-password -token -resetPasswordExpires')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      data: users
    })
  } catch (error) {
    console.error('Get all users error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    })
  }
}

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      })
    }

    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).select('-password -token -resetPasswordExpires')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.status(200).json({
      success: true,
      data: user,
      message: `User ${status === 'active' ? 'activated' : 'suspended'} successfully`
    })
  } catch (error) {
    console.error('Update user status error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    })
  }
}

export const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params

    const user = await User.findById(id)
      .populate('additionalDetails')
      .populate('courses')
      .select('-password -token -resetPasswordExpires')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.status(200).json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Get user details error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user details'
    })
  }
}

// Instructor Management
export const getAllInstructors = async (req, res) => {
  try {
    const instructors = await User.find({ accountType: 'Instructor' })
      .populate('additionalDetails')
      .select('-password -token -resetPasswordExpires')
      .sort({ createdAt: -1 })

    // Add course count and revenue for each instructor (this would typically come from course service)
    const enrichedInstructors = instructors.map(instructor => ({
      ...instructor.toObject(),
      courseCount: 0, // To be populated by course service
      totalRevenue: 0, // To be populated by payment service
      studentCount: 0 // To be populated by course service
    }))

    res.status(200).json({
      success: true,
      data: enrichedInstructors
    })
  } catch (error) {
    console.error('Get all instructors error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch instructors'
    })
  }
}

export const approveInstructor = async (req, res) => {
  try {
    const { id } = req.params
    const adminId = req.user.id

    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    if (user.accountType === 'Instructor') {
      return res.status(400).json({
        success: false,
        message: 'User is already an instructor'
      })
    }

    // Update user role
    user.accountType = 'Instructor'
    await user.save()

    // Update any pending instructor application
    await InstructorApplication.findOneAndUpdate(
      { userId: id },
      { 
        status: 'approved',
        reviewedBy: adminId,
        reviewedAt: new Date()
      }
    )

    res.status(200).json({
      success: true,
      message: 'Instructor role granted successfully'
    })
  } catch (error) {
    console.error('Approve instructor error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to approve instructor'
    })
  }
}

export const revokeInstructor = async (req, res) => {
  try {
    const { id } = req.params

    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    if (user.accountType !== 'Instructor') {
      return res.status(400).json({
        success: false,
        message: 'User is not an instructor'
      })
    }

    // Revoke instructor role
    user.accountType = 'Student'
    await user.save()

    res.status(200).json({
      success: true,
      message: 'Instructor role revoked successfully'
    })
  } catch (error) {
    console.error('Revoke instructor error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to revoke instructor role'
    })
  }
}

// Instructor Applications
export const getInstructorApplications = async (req, res) => {
  try {
    const applications = await InstructorApplication.find({ status: 'pending' })
      .populate('userId', 'firstName lastName email image')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      data: applications
    })
  } catch (error) {
    console.error('Get instructor applications error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch instructor applications'
    })
  }
}

export const approveInstructorApplication = async (req, res) => {
  try {
    const { id } = req.params
    const adminId = req.user.id

    const application = await InstructorApplication.findById(id)
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      })
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Application has already been processed'
      })
    }

    // Update application status
    application.status = 'approved'
    application.reviewedBy = adminId
    application.reviewedAt = new Date()
    await application.save()

    // Update user role
    const user = await User.findById(application.userId)
    user.accountType = 'Instructor'
    await user.save()

    res.status(200).json({
      success: true,
      message: 'Instructor application approved successfully'
    })
  } catch (error) {
    console.error('Approve instructor application error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to approve instructor application'
    })
  }
}

export const rejectInstructorApplication = async (req, res) => {
  try {
    const { id } = req.params
    const { rejectionReason } = req.body
    const adminId = req.user.id

    const application = await InstructorApplication.findById(id)
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      })
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Application has already been processed'
      })
    }

    // Update application status
    application.status = 'rejected'
    application.reviewedBy = adminId
    application.reviewedAt = new Date()
    application.rejectionReason = rejectionReason
    await application.save()

    res.status(200).json({
      success: true,
      message: 'Instructor application rejected successfully'
    })
  } catch (error) {
    console.error('Reject instructor application error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to reject instructor application'
    })
  }
}