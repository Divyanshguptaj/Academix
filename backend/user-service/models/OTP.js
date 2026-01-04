import mongoose from 'mongoose';
import mailSender from "../../shared-utils/mailSender.js"

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 5*60,
    }
})

// a function to send email
async function sendVerificationEmail(email, otp){
    try{
        const emailBody = `
            <p>Dear User,</p>
            <p>Your OTP for email verification is: <strong>${otp}</strong></p>
            <p>This OTP is valid for 5 minutes.</p>
            <p>Thank you!</p>
        `;
        // console.log(email)
        await mailSender(email, "Verification of Email", emailBody);
    }catch(error){
        throw error;
    }
}

OTPSchema.pre("save",async function(next){
    await sendVerificationEmail(this.email, this.otp);
    next();
})

const OTP = mongoose.model("OTP", OTPSchema);
export default OTP;
