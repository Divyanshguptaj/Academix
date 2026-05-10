import RefundRequest from '../models/RefundRequest.js'
import PaymentTransaction from '../models/PaymentTransaction.js'
import { instance } from '../config/razorpay.js'
import mongoose from 'mongoose'
import { withRetry, courseService, userService } from '../utils/serviceClients.js'
import { queueEmail } from '../../shared-utils/queue/email/emailQueue.js'
import { refundApprovedEmail } from '../../shared-utils/mail/templates/refundApprovedEmail.js'
import { refundRejectedEmail } from '../../shared-utils/mail/templates/refundRejectedEmail.js'

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
        const courseRes = await withRetry(() => courseService.get(`/course/get-courses-by-ids?ids=${courseIds.join(',')}`));
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
          student: student ? {
            _id: student._id,
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email,
            image: student.image
          } : null,
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
  let sessionEnded = false

  const endSession = async (abort = false) => {
    if (sessionEnded) return
    sessionEnded = true
    if (abort) await session.abortTransaction()
    session.endSession()
  }

  try {
    const { id } = req.params
    const adminId = req.user.id

    const refundRequest = await RefundRequest.findById(id).session(session)
    if (!refundRequest) {
      await endSession(true)
      return res.status(404).json({ success: false, message: 'Refund request not found' })
    }

    if (refundRequest.status !== 'pending') {
      await endSession(true)
      return res.status(400).json({ success: false, message: 'Refund request has already been processed' })
    }

    try {
      // Find the payment transaction to get the Razorpay payment ID
      const paymentTxn = await PaymentTransaction.findOne({
        $or: [
          ...(mongoose.Types.ObjectId.isValid(refundRequest.transactionId)
            ? [{ _id: refundRequest.transactionId }]
            : []),
          { razorpayOrderId: refundRequest.transactionId },
        ]
      }).session(session)

      if (!paymentTxn?.razorpayPaymentId) {
        await endSession(true)
        return res.status(400).json({
          success: false,
          message: 'Payment record not found or payment was never captured'
        })
      }

      // Process refund through Razorpay
      const refundResult = await instance.payments.refund(paymentTxn.razorpayPaymentId, {
        notes: { reason: 'Admin approved refund' }
      })

      // Update refund request status
      refundRequest.status = 'approved'
      refundRequest.processedBy = adminId
      refundRequest.processedAt = new Date()
      await refundRequest.save({ session })

      // Update payment transaction status
      await PaymentTransaction.findOneAndUpdate(
        { _id: paymentTxn._id },
        { status: 'refunded', refundId: refundResult.id },
        { session }
      )

      await session.commitTransaction()
      await endSession()

      // Unenroll student from the course (fire-and-forget — must not fail the refund response)
      const doUnenroll = async () => {
        await withRetry(() => courseService.post('/course/unenroll', {
          courses: [refundRequest.courseId.toString()],
          userId: refundRequest.studentId.toString()
        }))
        await withRetry(() => userService.post('/profile/remove-course', {
          userId: refundRequest.studentId.toString(),
          courseId: refundRequest.courseId.toString()
        }))
      }
      doUnenroll().catch(err => console.warn('Post-refund unenroll failed:', err.message))

      // Email student (fire-and-forget)
      const notifyApproval = async () => {
        const userRes = await userService.get(`/auth/get-users-by-ids?ids=${refundRequest.studentId}`)
        const student = userRes.data?.data?.[0]
        if (!student?.email) return
        const courseRes = await courseService.get(`/course/details/${refundRequest.courseId}`)
        const courseName = courseRes.data?.course?.courseName || 'your course'
        await queueEmail({
          email: student.email,
          title: 'Refund Approved — Academix',
          body: refundApprovedEmail(student.firstName, refundRequest.amount, courseName)
        })
      }
      notifyApproval().catch(err => console.warn('Refund approval email failed:', err.message))

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
      await endSession(true)

      // Record gateway failure so admin can see it without losing the request
      try {
        refundRequest.status = 'failed'
        refundRequest.processedBy = adminId
        refundRequest.processedAt = new Date()
        refundRequest.rejectionReason = 'Payment gateway error'
        await refundRequest.save()
      } catch (saveErr) {
        console.warn('Could not persist failed refund status:', saveErr.message)
      }

      res.status(500).json({
        success: false,
        message: 'Failed to process refund through payment gateway'
      })
    }
  } catch (error) {
    console.error('Process refund error:', error)
    await endSession(true)
    res.status(500).json({ success: false, message: 'Failed to process refund' })
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

    // Email student (fire-and-forget)
    const notifyRejection = async () => {
      const userRes = await userService.get(`/auth/get-users-by-ids?ids=${refundRequest.studentId}`)
      const student = userRes.data?.data?.[0]
      if (!student?.email) return
      const courseRes = await courseService.get(`/course/details/${refundRequest.courseId}`)
      const courseName = courseRes.data?.course?.courseName || 'your course'
      await queueEmail({
        email: student.email,
        title: 'Refund Request Update — Academix',
        body: refundRejectedEmail(student.firstName, courseName, refundRequest.rejectionReason)
      })
    }
    notifyRejection().catch(err => console.warn('Refund rejection email failed:', err.message))

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
