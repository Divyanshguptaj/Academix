import { instance } from "../config/razorpay.js";
import crypto from "crypto";
import axios from "axios";
import mailSender from "../../shared-utils/mailSender.js";
import mongoose from "mongoose";
import { paymentSuccessEmail } from "../../shared-utils/mail/templates/paymentSuccessEmail.js";
import { withRetry, courseService, userService } from "../utils/retryUtils.js";
import PaymentTransaction from "../models/PaymentTransaction.js";

// Capture the payment and initiate the Razorpay order
export const capturePayment = async (req, res) => {
  try {
    const { courses, userDetails } = req.body;
    const userId = userDetails._id;

    if (!courses || courses.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Please Provide Course ID" });
    }

    let total_amount = 0;
    const courseDetails = [];

    for (const courseObj of courses) {
      let course;
      try {
        // Ensure we're extracting the actual courseId
        const course_id = courseObj.courseId || courseObj;

        if (!mongoose.Types.ObjectId.isValid(course_id)) {
          return res
            .status(400)
            .json({
              success: false,
              message: `Invalid Course ID: ${course_id}`,
            });
        }

        // Get course details from Course Service API with retry logic
        const courseResponse = await withRetry(async () => {
          const response = await courseService.get(`/course/details/${course_id}`);
          if (!response.data.success) {
            throw new Error("Could not find the Course");
          }
          return response;
        });

        course = courseResponse.data.course;
        courseDetails.push(course);

        // Check if the user is already enrolled
        const uid = new mongoose.Types.ObjectId(userId);
        if (course.studentsEnrolled.includes(uid)) {
          return res
            .status(400)
            .json({ success: false, message: "Student is already Enrolled" });
        }

        total_amount += course.price;
      } catch (error) {
        console.error("Error finding course:", error);
        return res.status(500).json({ success: false, message: error.message });
      }
    }

    const options = {
      amount: total_amount * 100,
      currency: "INR",
      receipt: Math.random(Date.now()).toString(),
    };
    
    // Initiate the payment using Razorpay
    const paymentResponse = await instance.orders.create(options);
    
    // Save transaction to database
    const transaction = await PaymentTransaction.create({
      userId,
      courseIds: courseDetails.map(c => c._id),
      amount: total_amount,
      currency: "INR",
      razorpayOrderId: paymentResponse.id,
      status: "pending"
    });

    return res.json({
      success: true,
      message: paymentResponse,
      key: process.env.RAZORPAY_KEY_ID,
      transactionId: transaction._id
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    return res
      .status(500)
      .json({ success: false, message: "Could not initiate order." });
  }
};

// verify the payment with auto-refund on enrollment failure
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courses,
      userDetails,
    } = req.body;
    const userId = userDetails._id;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !courses ||
      !userId
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Payment Failed" });
    }

    let body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Payment Failed" });
    }

    // Update transaction status to verified
    await PaymentTransaction.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { 
        razorpayPaymentId: razorpay_payment_id,
        status: 'verified'
      }
    );

    // Try to enroll with auto-refund on failure
    await enrollStudentsWithAutoRefund(courses, userId, razorpay_payment_id);

    return res.status(200).json({ 
      success: true, 
      message: "Payment Verified and User Enrolled" 
    });
    
  } catch (error) {
    console.error("Error verifying payment:", error);
    
    // If error contains refund info, it's already handled
    if (error.message.includes('auto-refunded')) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

// Send Payment Success Email
export const sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body;
  // console.log(req.body);
  const userId = req.body.userDetails._id;

  if (!orderId || !paymentId || !amount || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all the details" });
  }

  try {
    // Get user details from User Service API
    const userResponse = await axios.get(`http://localhost:4001/profile/getUserDetails?email=${req.body.userDetails.email}`);
    if (!userResponse.data.success) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const enrolledStudent = userResponse.data.userDetails;

    await mailSender(
      enrolledStudent.email,
      `Payment Received`,
      paymentSuccessEmail(
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    );
  } catch (error) {
    console.log("error in sending mail", error);
    return res
      .status(400)
      .json({ success: false, message: "Could not send email" });
  }
};

// enroll the student in the courses with auto-refund on failure
const enrollStudentsWithAutoRefund = async (courses, userId, razorpayPaymentId) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    // 1. Try to enroll in courses with retry logic
    await withRetry(async () => {
      await courseService.post('/course/enroll', {
        courses, userId
      });
    });
    
    // 2. Try to add courses to user profile with retry logic
    await withRetry(async () => {
      for (const course of courses) {
        const courseId = typeof course === "object" ? course.courseId : course;
        await userService.post('/profile/add-course', {
          userId,
          courseId
        });
      }
    });
    
    // 3. Update transaction status to completed
    await PaymentTransaction.findOneAndUpdate(
      { razorpayPaymentId },
      { status: 'completed' }
    );
    
    await session.commitTransaction();
    return { success: true };
    
  } catch (error) {
    // CRITICAL: Auto-refund if enrollment fails
    console.error("Enrollment failed, initiating auto-refund:", error.message);
    
    try {
      await session.abortTransaction();
      
      // Initiate refund with Razorpay
      const refund = await instance.payments.refund(razorpayPaymentId, {
        notes: { reason: 'Enrollment failed - auto refund' }
      });
      
      // Update transaction status to refunded
      await PaymentTransaction.findOneAndUpdate(
        { razorpayPaymentId },
        { 
          status: 'refunded',
          refundId: refund.id,
          refundReason: 'Enrollment failed'
        }
      );
      
      console.log("Auto-refund completed:", refund.id);
      throw new Error(`Payment failed and auto-refunded. Refund ID: ${refund.id}`);
      
    } catch (refundError) {
      console.error("Auto-refund failed:", refundError.message);
      // If refund fails, mark as failed for manual intervention
      await PaymentTransaction.findOneAndUpdate(
        { razorpayPaymentId },
        { 
          status: 'failed',
          errorMessage: `Enrollment failed and auto-refund failed: ${refundError.message}`
        }
      );
      throw new Error(`Enrollment failed and auto-refund failed: ${refundError.message}`);
    }
  } finally {
    session.endSession();
  }
};

// Manual refund API for admin use
export const manualRefund = async (req, res) => {
  const { transactionId, reason } = req.body;
  
  try {
    const transaction = await PaymentTransaction.findById(transactionId);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found"
      });
    }
    
    if (transaction.status === 'refunded') {
      return res.status(400).json({
        success: false,
        message: "Transaction already refunded"
      });
    }
    
    // Initiate refund with Razorpay
    const refund = await instance.payments.refund(transaction.razorpayPaymentId, {
      notes: { reason }
    });
    
    // Update transaction
    transaction.status = 'refunded';
    transaction.refundId = refund.id;
    transaction.refundReason = reason;
    await transaction.save();
    
    // Rollback enrollment
    await rollbackEnrollment(transaction.courseIds, transaction.userId);
    
    return res.json({
      success: true,
      message: "Refund processed successfully",
      refundId: refund.id
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Refund failed: " + error.message
    });
  }
};

// Helper function to rollback enrollment
const rollbackEnrollment = async (courseIds, userId) => {
  try {
    // Remove from courses
    await withRetry(() => 
      courseService.post('/course/unenroll', {
        courses: courseIds,
        userId
      })
    );
    
    // Remove from user profile
    for (const courseId of courseIds) {
      await withRetry(() =>
        userService.post('/profile/remove-course', {
          userId,
          courseId
        })
      );
    }
  } catch (error) {
    console.error("Rollback failed:", error.message);
    // Log for manual intervention - don't throw error as refund already processed
  }
};
