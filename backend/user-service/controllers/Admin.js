import User from '../models/User.js'
import InstructorApplication from '../models/InstructorApplication.js'

// Admin Dashboard Stats
export const getDashboardStats = async (req, res) => {
  try {
    // Get user statistics
    const totalUsers = await User.countDocuments();
    const studentCount = await User.countDocuments({ accountType: 'Student' });
    const instructorCount = await User.countDocuments({ accountType: 'Instructor' });
    const adminCount = await User.countDocuments({ accountType: 'Admin' });
    const pendingInstructorApplications = await InstructorApplication.countDocuments({ status: 'pending' });

    // Fetch course statistics from Course Service
    let courseStats = {
      totalCourses: 0,
      publishedCourses: 0,
      draftCourses: 0,
      pendingCourseApprovals: 0
    };
    
    try {
      const courseResponse = await fetch('http://localhost:4002/admin/list');
      // console.log("Course service response status:", courseResponse);
      if (courseResponse.ok) {
        const courseData = await courseResponse.json();
        if (courseData.success && courseData.data) {
          const courses = Array.isArray(courseData.data) ? courseData.data : [];
          courseStats.totalCourses = courses.length;
          courseStats.publishedCourses = courses.filter(c => c.status === 'Published').length;
          courseStats.draftCourses = courses.filter(c => c.status === 'Draft').length;
          courseStats.pendingCourseApprovals = courses.filter(c => c.status === 'Pending').length;
        }
      }
    } catch (error) {
      console.error('Error fetching course stats:', error);
    }

    // Fetch revenue statistics from Payment Service
    let revenueStats = {
      totalRevenue: 0,
      monthlyRevenue: 0,
      pendingRevenue: 0
    };
    
    try {
      const paymentResponse = await fetch('http://localhost:4003/admin/refunds/analytics');
      console.log("Payment service response status:", paymentResponse);
      if (paymentResponse.ok) {
        const paymentData = await paymentResponse.json();
        if (paymentData.success && paymentData.data) {
          revenueStats.totalRevenue = paymentData.data.totalRevenue || 0;
          revenueStats.monthlyRevenue = paymentData.data.monthlyRevenue || 0;
          revenueStats.pendingRevenue = paymentData.data.pendingRevenue || 0;
        }
      }
    } catch (error) {
      console.error('Error fetching revenue stats:', error);
    }

    // Fetch refund statistics from Payment Service
    let refundStats = {
      pendingRefundRequests: 0
    };
    
    try {
      const refundResponse = await fetch('http://localhost:4003/admin/refunds');
      if (refundResponse.ok) {
        const refundData = await refundResponse.json();
        if (refundData.success && refundData.data) {
          const refunds = Array.isArray(refundData.data) ? refundData.data : [];
          refundStats.pendingRefundRequests = refunds.filter(r => r.status === 'pending').length;
        }
      }
    } catch (error) {
      console.error('Error fetching refund stats:', error);
    }

    // Calculate total pending actions
    const pendingActions = pendingInstructorApplications + courseStats.pendingCourseApprovals + refundStats.pendingRefundRequests;

    // Create recent activity (mock data for now, would come from activity logs)
    const recentActivity = [
      {
        action: "New User Registered",
        description: "5 new students joined today",
        timestamp: new Date().toISOString()
      },
      {
        action: "Course Published",
        description: "Advanced React course published",
        timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
      },
      {
        action: "Instructor Approved",
        description: "John Doe approved as instructor",
        timestamp: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
      },
      {
        action: "Refund Processed",
        description: "Refund request #1234 processed",
        timestamp: new Date(Date.now() - 10800000).toISOString() // 3 hours ago
      }
    ];

    const stats = {
      totalUsers,
      studentCount,
      instructorCount,
      adminCount,
      totalCourses: courseStats.totalCourses,
      publishedCourses: courseStats.publishedCourses,
      draftCourses: courseStats.draftCourses,
      pendingActions,
      pendingInstructorApplications,
      pendingCourseApprovals: courseStats.pendingCourseApprovals,
      pendingRefundRequests: refundStats.pendingRefundRequests,
      recentActivity,
      totalRevenue: revenueStats.totalRevenue,
      monthlyRevenue: revenueStats.monthlyRevenue,
      pendingRevenue: revenueStats.pendingRevenue
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