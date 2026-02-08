import mongoose from 'mongoose'

const refundRequestSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    transactionId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    reason: {
        type: String,
        required: true,
        maxlength: 500
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    processedAt: {
        type: Date,
        required: false
    },
    rejectionReason: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

// Update the updatedAt field before saving
refundRequestSchema.pre('save', function(next) {
    this.updatedAt = Date.now()
    next()
})

export default mongoose.model('RefundRequest', refundRequestSchema)