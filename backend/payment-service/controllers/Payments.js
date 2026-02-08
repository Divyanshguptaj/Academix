import { instance } from "../config/razorpay.js";
import crypto from "crypto";
import mailSender from "../../shared-utils/mailSender.js";
import mongoose from "mongoose";
import { paymentSuccessEmail } from "../../shared-utils/mail/templates/paymentSuccessEmail.js";
import { paymentFailureEmail } from "../../shared-utils/mail/templates/paymentFailureEmail.js";
import { withRetry, courseService, userService } from "../utils/retryUtils.js";
import PaymentTransaction from "../models/PaymentTransaction.js";

/**
 * Step 1: Create Razorpay order
 * Validates courses, calculates total amount, and creates order
 */
export const capturePayment = async (req, res) => {
  try {
    const { courses, userDetails } = req.body;
    const userId = userDetails?._id;

    console.log("📝 Payment Service - Initiating payment capture");
    console.log("User ID:", userId);
    console.log("Courses to enroll:", courses);

    // Validate input
    if (!courses || courses.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No courses provided" 
      });
    }

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid user ID" 
      });
    }

    let totalAmount = 0;
    const courseDetails = [];
    const enrolledSet = new Set();

    // Fetch all course details and calculate total
    for (const courseObj of courses) {
      try {
        const courseId = typeof courseObj === 'object' ? courseObj.courseId : courseObj;

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
          return res.status(400).json({ 
            success: false, 
            message: `Invalid Course ID format: ${courseId}` 
          });
        }

        // Skip duplicates
        if (enrolledSet.has(courseId.toString())) {
          continue;
        }

        // Fetch course details with retry
        const courseResponse = await withRetry(async () => {
          return await courseService.get(`/course/details/${courseId}`);
        });

        if (!courseResponse.data.success || !courseResponse.data.course) {
          return res.status(404).json({ 
            success: false, 
            message: `Course not found: ${courseId}` 
          });
        }

        const course = courseResponse.data.course;
        
        // Check if already enrolled
        const userObjectId = new mongoose.Types.ObjectId(userId);
        if (course.studentsEnrolled?.some(id => id.toString() === userObjectId.toString())) {
          return res.status(400).json({ 
            success: false, 
            message: `Already enrolled in: ${course.courseName}` 
          });
        }

        courseDetails.push(course);
        enrolledSet.add(courseId.toString());
        totalAmount += course.price || 0;
        console.log(`✓ Course validated: ${course.courseName} - Price: ${course.price}`);

      } catch (error) {
        console.error("Error processing course:", error.message);
        return res.status(500).json({ 
          success: false, 
          message: `Failed to process course: ${error.message}` 
        });
      }
    }

    if (courseDetails.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No valid courses to process" 
      });
    }

    if (totalAmount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid total amount" 
      });
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(totalAmount * 100), // Convert to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}_${userId.substring(0, 8)}`,
      notes: {
        courseCount: courseDetails.length,
        userId: userId
      },
      payment_capture: 1
    };

    console.log("Creating Razorpay order with amount:", options.amount);
    
    const razorpayOrder = await instance.orders.create(options);
    console.log("✓ Razorpay order created:", razorpayOrder.id);

    // Store transaction in database
    const transaction = await PaymentTransaction.create({
      userId,
      courseIds: courseDetails.map(c => c._id),
      amount: totalAmount,
      currency: "INR",
      razorpayOrderId: razorpayOrder.id,
      status: "pending"
    });

    console.log("✓ Transaction created:", transaction._id);

    return res.status(200).json({
      success: true,
      message: "Order created successfully",
      key: process.env.RAZORPAY_KEY_ID,
      orderId: razorpayOrder.id,
      transactionId: transaction._id,
      amount: options.amount,
      currency: "INR"
    });

  } catch (error) {
    console.error("❌ Payment capture error:", error.message);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to create order: " + error.message 
    });
  }
};

/**
 * Step 2: Verify payment signature and enroll student
 * Verifies Razorpay signature, enrolls student, and sends confirmation email
 */
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userDetails
    } = req.body;

    const userId = userDetails?._id;
    const userEmail = userDetails?.email;

    console.log("📝 Payment Service - Verifying payment");
    console.log("Order ID:", razorpay_order_id);
    console.log("Payment ID:", razorpay_payment_id);

    // Validate input
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields for verification" 
      });
    }

    // Verify Razorpay signature
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = shasum.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      console.error("❌ Signature verification failed");
      console.error("Expected:", generatedSignature);
      console.error("Received:", razorpay_signature);
      return res.status(400).json({ 
        success: false, 
        message: "Invalid payment signature - Payment declined" 
      });
    }

    console.log("✓ Signature verified successfully");

    // Find transaction
    const transaction = await PaymentTransaction.findOne({
      razorpayOrderId: razorpay_order_id
    });

    if (!transaction) {
      console.error("❌ Transaction not found:", razorpay_order_id);
      return res.status(404).json({ 
        success: false, 
        message: "Transaction not found" 
      });
    }

    // Prevent duplicate processing
    if (transaction.status !== 'pending') {
      console.log("⚠️  Transaction already processed:", transaction.status);
      return res.status(400).json({ 
        success: false, 
        message: `Transaction already ${transaction.status}` 
      });
    }

    // Update transaction with payment ID
    transaction.razorpayPaymentId = razorpay_payment_id;
    transaction.status = 'verified';
    await transaction.save();

    console.log("✓ Transaction verified");

    // Enroll student in courses with automatic rollback on failure
    try {
      await enrollStudentInCourses(transaction.courseIds, userId);
      console.log("✓ Student enrolled in courses");

      // Update transaction to completed
      transaction.status = 'completed';
      await transaction.save();
      console.log("✓ Transaction completed");

      // Send success email asynchronously (don't wait)
      sendSuccessEmail(razorpay_payment_id, transaction.amount, userEmail).catch(err => {
        console.warn("Email send failed:", err.message);
      });

      return res.status(200).json({ 
        success: true, 
        message: "Payment verified and enrollment completed",
        transactionId: transaction._id
      });

    } catch (enrollmentError) {
      console.error("❌ Enrollment failed:", enrollmentError.message);
      
      // Attempt auto-refund
      try {
        console.log("Initiating auto-refund...");
        console.log("Razorpay instance:", !!instance);
        console.log("Refund method:", typeof instance?.payments?.refund);
        console.log("Payment ID for refund:", razorpay_payment_id);
        // console.log(amount, transaction.amount, reason);
        const payment = await instance.payments.fetch(razorpay_payment_id);
        console.log("🔍 Razorpay payment status:", payment.status);

        const refund = await withRetry(async () => {
          return await instance.payments.refund(razorpay_payment_id, {
            notes: { reason: 'Enrollment failed' }
          });
        });
        
        transaction.status = 'refunded';
        transaction.refundReason = 'Enrollment failed';
        transaction.refundId = refund.id;
        await transaction.save();

        console.log("✓ Auto-refund issued");

        // Send failure email with refund notification
        sendFailureEmail(
          razorpay_payment_id, 
          transaction.amount, 
          razorpay_order_id, 
          userEmail, 
          refund.id
        ).catch(err => {
          console.warn("❌ Failure email send failed:", err.message);
        });
        
        return res.status(400).json({ 
          success: false, 
          message: "Enrollment failed - refund has been initiated" 
        });

      } catch (refundError) {
        console.error("❌ Auto-refund failed:", refundError.message);
        
        transaction.status = 'failed';
        transaction.errorMessage = `Enrollment failed and refund failed: ${refundError.message}`;
        await transaction.save();

        return res.status(500).json({ 
          success: false, 
          message: "Payment verified but enrollment failed - manual intervention required" 
        });
      }
    }

  } catch (error) {
    console.error("❌ Payment verification error:", error.message);
    return res.status(500).json({ 
      success: false, 
      message: "Verification failed: " + error.message 
    });
  }
};

/**
 * Manual refund for admin (rollback payment and enrollment)
 */
export const refundPayment = async (req, res) => {
  try {
    const { transactionId, reason } = req.body;

    if (!transactionId || !reason) {
      return res.status(400).json({ 
        success: false, 
        message: "Transaction ID and reason are required" 
      });
    }

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

    if (!transaction.razorpayPaymentId) {
      return res.status(400).json({ 
        success: false, 
        message: "No payment ID found for refund" 
      });
    }

    // Process refund
    console.log("Processing refund for transaction:", transactionId);
    const refund = await instance.payments.refund(transaction.razorpayPaymentId, {
      notes: { reason }
    });

    transaction.status = 'refunded';
    transaction.refundId = refund.id;
    transaction.refundReason = reason;
    await transaction.save();

    console.log("✓ Refund processed:", refund.id);

    // Unenroll from courses
    try {
      await unenrollFromCourses(transaction.courseIds, transaction.userId);
      console.log("✓ Student unenrolled from courses");
    } catch (unenrollError) {
      console.warn("⚠️  Unenrollment failed during refund:", unenrollError.message);
    }

    return res.status(200).json({
      success: true,
      message: "Refund processed successfully",
      refundId: refund.id
    });

  } catch (error) {
    console.error("❌ Refund error:", error.message);
    return res.status(500).json({ 
      success: false, 
      message: "Refund failed: " + error.message 
    });
  }
};

/**
 * Helper: Enroll student in multiple courses
 */
const enrollStudentInCourses = async (courseIds, userId) => {
  if (!courseIds || courseIds.length === 0) {
    throw new Error("No courses to enroll");
  }

  try {
    console.log("Enrolling student in courses:", courseIds.length);

    // Enroll in course service
    await withRetry(async () => {
      await courseService.post('/course/enroll', {
        courses: courseIds,
        userId
      });
    });

    console.log("✓ Course enrollment successful");

    // Update user profile with each course
    await withRetry(async () => {
      for (const courseId of courseIds) {
        await userService.post('/profile/add-course', {
          userId,
          courseId
        });
      }
    });

    console.log("✓ User profile updated");
    return { success: true };

  } catch (error) {
    console.error("Enrollment error:", error.message);
    throw new Error(`Enrollment failed: ${error.message}`);
  }
};

/**
 * Helper: Unenroll student from courses (used during refunds)
 */
const unenrollFromCourses = async (courseIds, userId) => {
  try {
    console.log("Unenrolling student from courses:", courseIds.length);

    await withRetry(async () => {
      await courseService.post('/course/unenroll', {
        courses: courseIds,
        userId
      });
    });

    for (const courseId of courseIds) {
      await withRetry(async () => {
        await userService.post('/profile/remove-course', {
          userId,
          courseId
        });
      });
    }

    console.log("✓ Unenrollment successful");
    return { success: true };

  } catch (error) {
    console.error("Unenrollment error:", error.message);
    throw error;
  }
};

/**
 * Helper: Send payment success email
 */
const sendSuccessEmail = async (paymentId, amount, email) => {
  try {
    if (!email) {
      console.warn("⚠️  No email provided for success notification");
      return;
    }

    console.log("📧 Sending payment success email to:", email);

    const emailSubject = "Payment Received - Enrollment Confirmed";
    const emailBody = paymentSuccessEmail(
      "Student",
      amount,
      paymentId,
      paymentId
    );

    await mailSender(email, emailSubject, emailBody);
    console.log("✓ Success email sent");

  } catch (error) {
    console.error("Error sending success email:", error.message);
    // Don't throw - email failure shouldn't block payment flow
  }
};

/**
 * Helper: Send payment failure email with refund notification
 */
const sendFailureEmail = async (paymentId, amount, orderId, email, refundId) => {
  try {
    if (!email) {
      console.warn("⚠️  No email provided for failure notification");
      return;
    }

    console.log("📧 Sending payment failure email to:", email);

    const emailSubject = "Payment Failed - Refund Initiated";
    const emailBody = paymentFailureEmail(
      "Student",
      amount,
      orderId,
      paymentId,
      refundId
    );

    await mailSender(email, emailSubject, emailBody);
    console.log("✓ Failure email sent");

  } catch (error) {
    console.error("Error sending failure email:", error.message);
    // Don't throw - email failure shouldn't block refund flow
  }
};
