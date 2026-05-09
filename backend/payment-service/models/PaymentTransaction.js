import mongoose from "mongoose";

const paymentTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  }],
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  razorpayOrderId: {
    type: String,
    required: true,
    unique: true
  },
  razorpayPaymentId: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  refundId: {
    type: String
  },
  refundReason: {
    type: String
  },
  errorMessage: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// userId: fetch a user's payment history
paymentTransactionSchema.index({ userId: 1 });
// status: admin filtering by pending/verified/completed/failed/refunded
paymentTransactionSchema.index({ status: 1 });

// Update updatedAt before saving
paymentTransactionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('PaymentTransaction', paymentTransactionSchema);