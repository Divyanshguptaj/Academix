import RefundRequest from '../models/RefundRequest.js'
import PaymentTransaction from '../models/PaymentTransaction.js'
import { capturePayment, refundPayment } from './Payments.js'
import mongoose from 'mongoose'
import { withRetry, courseService, userService } from '../utils/serviceClients.js'

// Refund Management
export const getRefundRequests = async (req, res) => {
  try {
    // Removed native Mongoose populate since student and course models reside in different microservices
    const refundRequests = await RefundRequest.find().sort({ createdAt: -1 })

    // Enrich with additional data
    const enrichedRequests = await Promise.all(
      refundRequests.map(async (request) => {
        let student = null;
        let course = null;
        let instructor = null;

        try {
          const studentResponse = await withRetry(() => userService.get(`/profile/user/${request.studentId}`));
          student = studentResponse.data?.user || null;
        } catch (err) {
          console.warn(`Could not fetch student details for ${request.studentId}`);
        }

        try {
          const courseResponse = await withRetry(() => courseService.get(`/course/details/${request.courseId}`));
          course = courseResponse.data?.course || null;

          if (course && course.instructor) {
            const instructorId = typeof course.instructor === 'object' ? course.instructor._id : course.instructor;
            const instructorResponse = await withRetry(() => userService.get(`/profile/user/${instructorId}`));
            instructor = instructorResponse.data?.user || null;
          }
        } catch (err) {
          console.warn(`Could not fetch course/instructor details for ${request.courseId}`);
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
    )

    return res.status(200).json({
      success: true,
      data: enrichedRequests
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
  console.log("Fetching comprehensive analytics...")
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
    
    console.log("Comprehensive analytics calculated:", analytics)
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
