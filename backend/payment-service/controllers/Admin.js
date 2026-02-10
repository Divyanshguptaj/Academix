import RefundRequest from '../models/RefundRequest.js'
import User from '../../user-service/models/User.js'
import Course from '../../course-service/models/Course.js'
import PaymentTransaction from '../models/PaymentTransaction.js'
import { capturePayment, refundPayment } from './Payments.js'

// Refund Management
export const getRefundRequests = async (req, res) => {
  try {
    const refundRequests = await RefundRequest.find()
      .populate('studentId', 'firstName lastName email image')
      .populate('courseId', 'courseName instructor')
      .sort({ createdAt: -1 })

    // Enrich with additional data
    const enrichedRequests = await Promise.all(
      refundRequests.map(async (request) => {
        const course = await Course.findById(request.courseId)
        const instructor = await User.findById(course.instructor)
        
        return {
          ...request.toObject(),
          course: {
            ...course.toObject(),
            instructor: {
              firstName: instructor?.firstName,
              lastName: instructor?.lastName,
              email: instructor?.email
            }
          }
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
  try {
    const { id } = req.params
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

    try {
      // Process refund through Razorpay
      const refundResult = await refundPayment(refundRequest.transactionId, refundRequest.amount)

      // Update refund request status
      refundRequest.status = 'approved'
      refundRequest.processedBy = adminId
      refundRequest.processedAt = new Date()
      await refundRequest.save()

      // Update payment transaction status
      await PaymentTransaction.findOneAndUpdate(
        { transactionId: refundRequest.transactionId },
        { status: 'refunded', refundId: refundResult.id }
      )

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
      
      // Update refund request status to failed
      refundRequest.status = 'failed'
      refundRequest.processedBy = adminId
      refundRequest.processedAt = new Date()
      refundRequest.rejectionReason = 'Payment gateway error'
      await refundRequest.save()

      res.status(500).json({
        success: false,
        message: 'Failed to process refund through payment gateway'
      })
    }
  } catch (error) {
    console.error('Process refund error:', error)
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
