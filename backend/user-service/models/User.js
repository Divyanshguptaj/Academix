import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
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
        trim: true,
        unique: true,
        index: true,
    },
    password: {
        type: String,
        required: true,
    },
    accountType: {
        type: String,
        enum: ['Admin', 'Student', 'Instructor'],
        default: 'Student'
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
    additionalDetails:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Profile",
    },
    courses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
        }
    ],
    image:{
        type: String,
        required: true
    },
    token:{
        type: String,
    },
    resetPasswordExpires:{
        type: Date,
    },
    tokenVersion: {
        type: Number,
        default: 0,
    },
    courseProgress:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CourseProgress",
        }
    ]
})

// Text index for fast, optimized search queries on Users
userSchema.index(
    {
        firstName: "text",
        lastName: "text",
        email: "text"
    },
    {
        name: "user_text_search",
    }
)

// token: reset-password lookup (findOne({ token })) — sparse so null tokens aren't indexed
userSchema.index({ token: 1 }, { sparse: true });
// accountType: admin dashboard counts + instructor/student filters
userSchema.index({ accountType: 1 });

export default mongoose.model('User', userSchema);
