import User from '../models/User.js'
import InstructorApplication from '../models/InstructorApplication.js'
import { courseService, paymentService } from '../utils/serviceClients.js'
import { queueEmail } from '../../shared-utils/queue/email/emailQueue.js'
import { instructorApprovalEmail } from '../../shared-utils/mail/templates/instructorApprovalEmail.js'
import { instructorRejectionEmail } from '../../shared-utils/mail/templates/instructorRejectionEmail.js'
import { instructorRevokeEmail } from '../../shared-utils/mail/templates/instructorRevokeEmail.js'

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
      const courseResponse = await courseService.get('/admin/list?limit=1000');
      const courseData = courseResponse.data;
      if (courseData.success && courseData.data) {
        const courses = Array.isArray(courseData.data) ? courseData.data : [];
        courseStats.totalCourses = courses.length;
        courseStats.publishedCourses = courses.filter(c => c.status === 'Published').length;
        courseStats.draftCourses = courses.filter(c => c.status === 'Draft').length;
        courseStats.pendingCourseApprovals = courses.filter(c => c.status === 'Pending').length;
      }
    } catch (error) {
      console.error('Error fetching course stats:', error.message);
    }

    // Fetch revenue statistics from Payment Service
    let revenueStats = {
      totalRevenue: 0,
      monthlyRevenue: 0,
      pendingRevenue: 0
    };

    try {
      const paymentResponse = await paymentService.get('/admin/refunds/analytics');
      const paymentData = paymentResponse.data;
      if (paymentData.success && paymentData.data) {
        revenueStats.totalRevenue = paymentData.data.totalRevenue || 0;
        revenueStats.monthlyRevenue = paymentData.data.monthlyRevenue || 0;
        revenueStats.pendingRevenue = paymentData.data.pendingRevenue || 0;
      }
    } catch (error) {
      console.error('Error fetching revenue stats:', error.message);
    }

    // Fetch refund statistics from Payment Service
    let refundStats = {
      pendingRefundRequests: 0
    };

    try {
      const refundResponse = await paymentService.get('/admin/refunds');
      const refundData = refundResponse.data;
      if (refundData.success && refundData.data) {
        const refunds = Array.isArray(refundData.data) ? refundData.data : [];
        refundStats.pendingRefundRequests = refunds.filter(r => r.status === 'pending').length;
      }
    } catch (error) {
      console.error('Error fetching refund stats:', error.message);
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
    // Support pagination, search, and accountType filtering (removed unused 'status' filter)
    const { page = 1, limit = 10, search = "", accountType = "all" } = req.query;

    const query = {};

    if (accountType && accountType !== "all") {
      query.accountType = accountType;
    }

    if (search && search.trim().length > 0) {
      const safeSearch = search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      query.$or = [
        { firstName: { $regex: safeSearch, $options: "i" } },
        { lastName: { $regex: safeSearch, $options: "i" } },
        { email: { $regex: safeSearch, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [totalUsers, users] = await Promise.all([
      User.countDocuments(query),
      User.find(query)
        .populate('additionalDetails')
        .select('-password -token -resetPasswordExpires')
        .sort({ _id: -1 })
        .skip(skip)
        .limit(Number(limit))
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
        totalUsers,
        totalPages: Math.ceil(totalUsers / Number(limit)) || 1,
        currentPage: Number(page)
      }
    })
  } catch (error) {
    console.error('Get all users error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
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
    const { page = 1, limit = 10, search = "" } = req.query;
    const query = { accountType: 'Instructor' };

    if (search && search.trim().length > 0) {
      const safeSearch = search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      query.$or = [
        { firstName: { $regex: safeSearch, $options: "i" } },
        { lastName: { $regex: safeSearch, $options: "i" } },
        { email: { $regex: safeSearch, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [totalInstructors, instructors] = await Promise.all([
      User.countDocuments(query),
      User.find(query).populate('additionalDetails').select('-password -token -resetPasswordExpires').sort({ _id: -1 }).skip(skip).limit(Number(limit))
    ]);

    // Fetch all courses from course-service to enrich instructor stats
    let allCourses = []
    try {
      const courseResponse = await courseService.get('/admin/list?limit=1000');
      if (courseResponse.data?.success && Array.isArray(courseResponse.data.data)) {
        allCourses = courseResponse.data.data
      }
    } catch (err) {
      console.error('Could not fetch courses for instructor enrichment:', err.message)
    }

    const enrichedInstructors = instructors.map(instructor => {
      const id = instructor._id.toString()
      const instructorCourses = allCourses.filter(c => {
        const cInstructor = c.instructor?._id || c.instructor
        return cInstructor?.toString() === id
      })
      const studentCount = instructorCourses.reduce((sum, c) => {
        const enrolled = Array.isArray(c.studentsEnrolled) ? c.studentsEnrolled.length : (c.enrolledStudents || 0)
        return sum + enrolled
      }, 0)
      return {
        ...instructor.toObject(),
        courseCount: instructorCourses.length,
        totalRevenue: 0, // Revenue requires payment-service join — not implemented yet
        studentCount,
      }
    })

    res.status(200).json({
      success: true,
      data: {
        instructors: enrichedInstructors,
        totalInstructors,
        totalPages: Math.ceil(totalInstructors / Number(limit)) || 1,
        currentPage: Number(page)
      }
    })
  } catch (error) {
    console.error('Get all instructors error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch instructors'
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

    // Reset InstructorApplication so the user can re-apply
    await InstructorApplication.findOneAndUpdate(
      { userId: id },
      { status: 'rejected', rejectionReason: 'Instructor access revoked by admin.' }
    )

    // Queue notification email — non-blocking
    queueEmail({ email: user.email, title: 'Instructor Access Update — Academix', body: instructorRevokeEmail(user.firstName) }).catch(e => console.error('Revoke email queue failed:', e.message))

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
    const { page = 1, limit = 10, search = "" } = req.query;
    let query = { status: 'pending' };

    if (search && search.trim().length > 0) {
      const safeSearch = search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      const matchingUsers = await User.find({
        $or: [
          { firstName: { $regex: safeSearch, $options: "i" } },
          { lastName: { $regex: safeSearch, $options: "i" } },
          { email: { $regex: safeSearch, $options: "i" } },
        ]
      }).select('_id');
      query.userId = { $in: matchingUsers.map(u => u._id) };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [totalApplications, applications] = await Promise.all([
      InstructorApplication.countDocuments(query),
      InstructorApplication.find(query).populate('userId', 'firstName lastName email image').sort({ _id: -1 }).skip(skip).limit(Number(limit))
    ]);

    res.status(200).json({
      success: true,
      data: {
        applications,
        totalApplications,
        totalPages: Math.ceil(totalApplications / Number(limit)) || 1,
        currentPage: Number(page)
      }
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

    // Queue notification email — non-blocking
    queueEmail({ email: user.email, title: 'Instructor Application Approved — Academix', body: instructorApprovalEmail(user.firstName) }).catch(e => console.error('Approval email queue failed:', e.message))

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

    // Queue notification email — non-blocking
    User.findById(application.userId).then(user => {
      if (user) queueEmail({ email: user.email, title: 'Instructor Application Update — Academix', body: instructorRejectionEmail(user.firstName, rejectionReason) }).catch(e => console.error('Rejection email queue failed:', e.message))
    }).catch(() => {})

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