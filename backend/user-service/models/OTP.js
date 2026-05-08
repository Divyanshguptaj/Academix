import mongoose from 'mongoose';

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        index: true,
    },
    otp: {
        type: String,
        required: true,
        index: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 5*60,
    }
})

const OTP = mongoose.model("OTP", OTPSchema);
export default OTP;
