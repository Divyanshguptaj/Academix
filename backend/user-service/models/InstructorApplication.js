import mongoose from 'mongoose'

const instructorApplicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    qualifications: {
        type: String,
        required: true
    },
    experience: {
        type: String,
        required: true
    },
    expertise: {
        type: [String],
        required: true
    },
    bio: {
        type: String,
        required: true
    },
    portfolio: {
        type: String,
        required: false
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    reviewedAt: {
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
instructorApplicationSchema.pre('save', function(next) {
    this.updatedAt = Date.now()
    next()
})

export default mongoose.model('InstructorApplication', instructorApplicationSchema)