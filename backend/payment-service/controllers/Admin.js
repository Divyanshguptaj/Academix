import RefundRequest from '../models/RefundRequest.js'
import PaymentTransaction from '../models/PaymentTransaction.js'
import { capturePayment, refundPayment } from './Payments.js'
import mongoose from 'mongoose'
import { withRetry, courseService, userService } from '../utils/serviceClients.js'

// Refund Management
export const getRefundRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = "all" } = req.query;
    
    const query = {};
    if (status && status !== "all") {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [totalRefunds, refundRequests] = await Promise.all([
      RefundRequest.countDocuments(query),
      RefundRequest.find(query).sort({ _id: -1 }).skip(skip).limit(Number(limit))
    ]);

    // Gather unique IDs for bulk fetching
    const studentIds = [...new Set(refundRequests.map(r => r.studentId.toString()))];
    const courseIds = [...new Set(refundRequests.map(r => r.courseId.toString()))];

    // Bulk fetch students
    let studentsMap = {};
    if (studentIds.length > 0) {
      try {
        const studentRes = await withRetry(() => userService.get(`/auth/get-users-by-ids?ids=${studentIds.join(',')}`));
        const students = studentRes.data?.data || [];
        students.forEach(s => studentsMap[s._id] = s);
      } catch (err) {
        console.warn('Could not fetch students in bulk');
      }
    }

    // Bulk fetch courses and instructors
    let coursesMap = {};
    let instructorsMap = {};
    if (courseIds.length > 0) {
      try {
        const courseRes = await withRetry(() => courseService.get(`/course/getCourseByIds?ids=${courseIds.join(',')}`));
        const courses = courseRes.data?.data || [];
        
        const instructorIds = [...new Set(courses.map(c => typeof c.instructor === 'object' ? c.instructor._id : c.instructor).filter(Boolean))];
        
        if (instructorIds.length > 0) {
          const instRes = await withRetry(() => userService.get(`/auth/get-instructors-by-ids?ids=${instructorIds.join(',')}`));
          const instructors = instRes.data?.data || [];
          instructors.forEach(i => instructorsMap[i._id] = i);
        }

        courses.forEach(c => coursesMap[c._id] = c);
      } catch (err) {
        console.warn('Could not fetch courses or instructors in bulk');
      }
    }

    // Enrich with additional data
    const enrichedRequests = refundRequests.map((request) => {
        const student = studentsMap[request.studentId.toString()] || null;
        const course = coursesMap[request.courseId.toString()] || null;
        let instructor = null;
        
        if (course && course.instructor) {
          const instId = typeof course.instructor === 'object' ? course.instructor._id : course.instructor;
          instructor = instructorsMap[instId.toString()] || null;
        }
        
        return {
          ...request.toObject(),
          studentId: student ? {
            _id: student._id,
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email,
            image: student.image
          } : request.studentId,
          course: course ? {
            ...course,
            instructor: instructor ? {
              firstName: instructor.firstName,
              lastName: instructor.lastName,
              email: instructor.email
            } : course.instructor
          } : { _id: request.courseId }
        }
      })

    return res.status(200).json({
      success: true,
      data: {
        refunds: enrichedRequests,
        totalRefunds,
        totalPages: Math.ceil(totalRefunds / Number(limit)) || 1,
        currentPage: Number(page)
      }
    })
  } catch (error) {
    console.error('Get refund requests error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch refund requests'
    })
  }
}

export const processRefund = async (req, res) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const { id } = req.params
    const adminId = req.user.id

    const refundRequest = await RefundRequest.findById(id).session(session)
    if (!refundRequest) {
      await session.abortTransaction()
      session.endSession()
      return res.status(404).json({
        success: false,
        message: 'Refund request not found'
      })
    }

    if (refundRequest.status !== 'pending') {
      await session.abortTransaction()
      session.endSession()
      return res.status(400).json({
        success: false,
        message: 'Refund request has already been processed'
      })
    }

    try {
      // Process refund through Razorpay
      const refundResult = await refundPayment(refundRequest.transactionId, refundRequest.amount)

      // Update refund request status
      refundRequest.status = 'approved'
      refundRequest.processedBy = adminId
      refundRequest.processedAt = new Date()
      await refundRequest.save({ session })

      // Update payment transaction status
      await PaymentTransaction.findOneAndUpdate(
        { _id: refundRequest.transactionId },
        { status: 'refunded', refundId: refundResult.id },
        { session }
      )

      await session.commitTransaction()
      session.endSession()

      res.status(200).json({
        success: true,
        message: 'Refund processed successfully',
        data: {
          refundId: refundResult.id,
          amount: refundResult.amount,
          status: refundResult.status
        }
      })
    } catch (refundError) {
      console.error('Refund processing error:', refundError)
      
      await session.abortTransaction()
      session.endSession()

      // Update refund request status to failed
      refundRequest.status = 'failed'
      refundRequest.processedBy = adminId
      refundRequest.processedAt = new Date()
      refundRequest.rejectionReason = 'Payment gateway error'
      await refundRequest.save() // Saved outside of transaction so the failure state persists

      res.status(500).json({
        success: false,
        message: 'Failed to process refund through payment gateway'
      })
    }
  } catch (error) {
    console.error('Process refund error:', error)
    await session.abortTransaction()
    session.endSession()
    res.status(500).json({
      success: false,
      message: 'Failed to process refund'
    })
  }
}

export const rejectRefund = async (req, res) => {
  try {
    const { id } = req.params
    const { rejectionReason } = req.body
    const adminId = req.user.id

    const refundRequest = await RefundRequest.findById(id)
    if (!refundRequest) {
      return res.status(404).json({
        success: false,
        message: 'Refund request not found'
      })
    }

    if (refundRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Refund request has already been processed'
      })
    }

    // Update refund request status
    refundRequest.status = 'rejected'
    refundRequest.processedBy = adminId
    refundRequest.processedAt = new Date()
    refundRequest.rejectionReason = rejectionReason || 'Not specified'
    await refundRequest.save()

    res.status(200).json({
      success: true,
      message: 'Refund request rejected successfully'
    })
  } catch (error) {
    console.error('Reject refund error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to reject refund request'
    })
  }
}

export const getRefundAnalytics = async (req, res) => {
  try {
    // Calculate Refund Statistics
    const totalRefunds = await RefundRequest.countDocuments()
    const pendingRefunds = await RefundRequest.countDocuments({ status: 'pending' })
    const approvedRefunds = await RefundRequest.countDocuments({ status: 'approved' })
    const rejectedRefunds = await RefundRequest.countDocuments({ status: 'rejected' })
    
    const totalRefundAmount = await RefundRequest.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
    
    const pendingRefundAmount = await RefundRequest.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])

    // Calculate Revenue Statistics
    const totalRevenue = await PaymentTransaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
    
    const pendingRevenue = await PaymentTransaction.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])

    // Calculate Monthly Revenue (current month)
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    
    const monthlyRevenue = await PaymentTransaction.aggregate([
      { 
        $match: { 
          status: 'completed',
          createdAt: { $gte: startOfMonth, $lt: endOfMonth }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])

    const analytics = {
      // Revenue Analytics
      totalRevenue: totalRevenue[0]?.total || 0,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      pendingRevenue: pendingRevenue[0]?.total || 0,
      
      // Refund Analytics
      totalRequests: totalRefunds,
      pendingRequests: pendingRefunds,
      approvedRequests: approvedRefunds,
      rejectedRequests: rejectedRefunds,
      totalAmount: totalRefundAmount[0]?.total || 0,
      pendingAmount: pendingRefundAmount[0]?.total || 0,
      approvalRate: totalRefunds > 0 ? Math.round((approvedRefunds / totalRefunds) * 100) : 0,
      rejectionRate: totalRefunds > 0 ? Math.round((rejectedRefunds / totalRefunds) * 100) : 0
    }
    
    return res.status(200).json({
      success: true,
      data: analytics
    })
  } catch (error) {
    console.error('Get comprehensive analytics error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    })
  }
}
