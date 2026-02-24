import User from "../models/User.js";
import OTP from "../models/OTP.js";
import InstructorApplication from "../models/InstructorApplication.js";
import otpgenerator from "otp-generator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Profile from "../models/Profile.js";
import mongoose from "mongoose";
import mailSender from "../../shared-utils/mailSender.js";

// Maximum number of instructor application submissions per user
const MAX_INSTRUCTOR_APPLICATIONS = 3;

function instructorApplicationEmailTemplate(firstName, submissionCount) {
  const isResubmission = submissionCount > 1;
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#1a1a2e;color:#fff;border-radius:12px;border:1px solid #374151;">
      <h2 style="color:#fcd34d;margin-top:0;">Application ${isResubmission ? 'Re-submitted' : 'Received'} ✓</h2>
      <p>Hi ${firstName},</p>
      <p>We've received your instructor application${isResubmission ? ` (attempt <strong>${submissionCount}</strong> of <strong>${MAX_INSTRUCTOR_APPLICATIONS}</strong>)` : ''}. Our admin team will review it and get back to you shortly.</p>
      <p>You'll receive another email once a decision has been made. Until then, keep learning on <strong>Academix</strong>!</p>
      <hr style="border-color:#374151;margin:20px 0;" />
      <p style="color:#9ca3af;font-size:12px;margin:0;">— The Academix Team</p>
    </div>
  `;
}

// Decode HTML entities that sanitizers may introduce into URLs (e.g. &#x2F; → /)
const decodeHtmlEntities = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str
    .replace(/&#x2F;/gi, '/')
    .replace(/&#x27;/gi, "'")
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"');
};

//Send OTP -
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email format
    if (!email || !email.includes('@') || !email.includes('.')) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    const checkUserPresent = await User.findOne({ email });
    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "An account already exists with this email. Please login instead.",
      });
    }

    let otp;
    let result;

    // Generate unique OTP
    do {
      otp = otpgenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });

      result = await OTP.findOne({ otp: otp });
    } while (result);

    // Store OTP with expiration
    const otpPayload = { email, otp };
    await OTP.create(otpPayload);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email",
      otp,
    });
  } catch (error) {
    console.error("OTP Generation Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate OTP. Please try again later.",
    });
  }
};

//sign Up -
export const signUp = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      contactNumber,
      otp,
    } = req.body;

    //validation
    if (!firstName || !lastName || !password || !confirmPassword || !otp) {
      return res.status(403).json({
        success: false,
        message: "Please fill in all required fields",
      });
    }

    // Password complexity validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    if (!/\d/.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least one number",
      });
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least one special character",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const recentOTP = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);

    if (recentOTP.length === 0) {
      return res.status(400).json({
        success: false,
        message: "OTP verification failed. Please request a new OTP",
      });
    }

    // Safety check: OTP must be within 5 minutes (TTL index handles auto-deletion,
    // but this guards the race-condition window before MongoDB TTL runs)
    const OTP_EXPIRY_MS = 5 * 60 * 1000;
    if (Date.now() - new Date(recentOTP[0].createdAt).getTime() > OTP_EXPIRY_MS) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one",
      });
    }

    if (otp !== recentOTP[0].otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please check and try again",
      });
    }

    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    //create profile -
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });
    if (contactNumber) profileDetails.contactNumber = contactNumber;

    //create entry of user
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    return res.status(200).json({
      success: true,
      message: "User is registered successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "User can't registered!, please try again . . .",
    });
  }
};

//login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Fields can't be empty",
      });
    }
    
    // Check if user exists
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No account found with this email address",
      });
    }
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "The password you entered is incorrect",
      });
    }

    // Generate JWT token
    const payload = {
      email: user.email,
      id: user._id,
      accountType: user.accountType,
      tokenVersion: user.tokenVersion,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Prepare user data for response (exclude sensitive info)
    const userData = user.toObject();
    userData.token = token;
    delete userData.password;

    // Set cookie options
    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    return res.cookie("token", token, options).status(200).json({
      success: true,
      token,
      user: userData,
      message: "Login successful! Welcome back.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Login failed , Please try again later...",
    });
  }
};

//ye bacha hua hai
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, mail } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Password fields cannot be empty",
      });
    }
    // console.log(mail)
    // Find user by email
    const user = await User.findOne({ email: mail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Compare old password with stored password
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    user.password = hashedPassword;
    await user.save(); // ✅ Save changes

    return res.status(200).json({
      success: true,
      message: "Password Updated Successfully",
    });
  } catch (error) {
    console.error("Change Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Google OAuth User Sync
export const googleAuth = async (req, res) => {
  try {
    const { email, firstName, lastName, password, picture, auth0Id, accountType, mode } = req.body;

    // console.log(`Google Auth - Mode: ${mode}, Email: ${email}, Has Password: ${!!password}`);

    // Validation
    if (!email || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: "Email, first name, and last name are required",
      });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // User exists - login them regardless of mode
      // console.log(`User exists - logging in: ${email}`);
      
      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
        tokenVersion: user.tokenVersion,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      user.password = undefined;

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

      return res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          accountType: user.accountType,
          image: user.image,
        },
        message: mode === 'signup' ? "You already have an account. Logging in..." : "Login successful",
      });
    }

    // New user - only allow signup mode
    if (mode === 'login') {
      return res.status(404).json({
        success: false,
        message: "User not found. Please sign up first.",
      });
    }

    if (mode === 'signup' && !password) {
      return res.status(400).json({
        success: false,
        message: "Password is required for signup",
      });
    }

    // console.log(`Creating new user: ${email}`);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create profile
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });

    // Create user
    user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      accountType: accountType || 'Student',
      additionalDetails: profileDetails._id,
      image: picture
        ? decodeHtmlEntities(picture).replace('=s96-c', '=s200-c')
        : `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    // console.log(`New user created: ${user._id}`);

    // Generate token
    const payload = {
      email: user.email,
      id: user._id,
      accountType: user.accountType,
      tokenVersion: user.tokenVersion,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    user.password = undefined;

    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    return res.cookie("token", token, options).status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        accountType: user.accountType,
        image: user.image,
      },
      message: "Account created successfully. Welcome!",
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    return res.status(500).json({
      success: false,
      message: "Google authentication failed. Please try again.",
    });
  }
};

// Get user by email (for Course Service communication)
export const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email }).select('-password -token -resetPasswordExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get User by Email Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get instructors by IDs (for Course Service communication)
export const getInstructorsByIds = async (req, res) => {
  try {
    const { ids, fields } = req.query;
    console.log("Received IDs:", ids);
    if (!ids) {
      return res.status(400).json({
        success: false,
        message: "Instructor IDs are required",
      });
    }

    // Split the comma-separated IDs and validate them
    const instructorIds = ids.split(',').map(id => id.trim());
    console.log("Requested instructor IDs:", instructorIds);
    // Validate all IDs are valid ObjectIds
    for (const id of instructorIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: `Invalid instructor ID: ${id}`,
        });
      }
    }
    console.log("All instructor IDs are valid.");
    // Build select query based on fields parameter
    let selectFields;
    if (fields) {
      const requestedFields = fields.split(',').map(field => field.trim());
      // Only allow safe fields to be selected
      const allowedFields = ['firstName', 'lastName', 'image', 'additionalDetails'];
      const validFields = requestedFields.filter(field => allowedFields.includes(field));
      // Include only the requested safe fields
      selectFields = validFields.join(' ');
    } else {
      // Default selection - exclude sensitive fields
      selectFields = 'firstName lastName image additionalDetails';
    }
    console.log("Select fields:", selectFields);  
    // First, check if the user exists at all
    const allUsers = await User.find({ _id: { $in: instructorIds } });
    console.log("All users found:", allUsers.map(u => ({ id: u._id, accountType: u.accountType, email: u.email })));
    
    // Fetch instructors with populated additionalDetails
    const instructors = await User.find({ 
      _id: { $in: instructorIds },
      accountType: 'Instructor'
    })
    .select(selectFields)
    .populate('additionalDetails')
    .exec();
    console.log("Fetched instructors:", instructors);
    if (!instructors || instructors.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No instructors found for the provided IDs",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Instructors fetched successfully",
      data: instructors,
    });
  } catch (error) {
    console.error("Get Instructors by IDs Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get current user's instructor application status
export const getMyInstructorApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const application = await InstructorApplication.findOne({ userId });
    if (!application) {
      return res.status(200).json({ success: true, data: null });
    }
    return res.status(200).json({
      success: true,
      data: {
        status: application.status,
        submissionCount: application.submissionCount,
        remainingAttempts: MAX_INSTRUCTOR_APPLICATIONS - application.submissionCount,
        maxAttempts: MAX_INSTRUCTOR_APPLICATIONS,
        rejectionReason: application.rejectionReason || null,
        updatedAt: application.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get my instructor application error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch application status" });
  }
};

// Submit Instructor Application
export const submitInstructorApplication = async (req, res) => {
  try {
    const { qualifications, experience, expertise, bio, portfolio } = req.body;
    const userId = req.user.id;

    if (!qualifications || !experience || !expertise || !bio) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const user = await User.findById(userId);
    if (user.accountType === 'Instructor' || user.accountType === 'Admin') {
      return res.status(400).json({ success: false, message: "You already have instructor privileges" });
    }

    const expertiseArray = Array.isArray(expertise)
      ? expertise
      : expertise.split(',').map((item) => item.trim());

    const existingApplication = await InstructorApplication.findOne({ userId });

    if (existingApplication) {
      if (existingApplication.status === 'pending') {
        return res.status(400).json({ success: false, message: "Your application is currently under review" });
      }
      if (existingApplication.status === 'approved') {
        return res.status(400).json({ success: false, message: "Your application was already approved" });
      }
      // Status is 'rejected' — check if more attempts are allowed
      if (existingApplication.submissionCount >= MAX_INSTRUCTOR_APPLICATIONS) {
        return res.status(400).json({
          success: false,
          message: `You have reached the maximum number of applications (${MAX_INSTRUCTOR_APPLICATIONS})`,
        });
      }
      // Re-submission: update the existing record
      existingApplication.status = 'pending';
      existingApplication.submissionCount += 1;
      existingApplication.qualifications = qualifications;
      existingApplication.experience = experience;
      existingApplication.expertise = expertiseArray;
      existingApplication.bio = bio;
      existingApplication.portfolio = portfolio || undefined;
      existingApplication.rejectionReason = undefined;
      existingApplication.reviewedBy = undefined;
      existingApplication.reviewedAt = undefined;
      await existingApplication.save();

      try {
        await mailSender(
          user.email,
          'Instructor Application Re-submitted — Academix',
          instructorApplicationEmailTemplate(user.firstName, existingApplication.submissionCount)
        );
      } catch (e) {
        console.error('Instructor application email failed:', e.message);
      }

      return res.status(200).json({
        success: true,
        message: "Application re-submitted successfully",
        data: {
          submissionCount: existingApplication.submissionCount,
          remainingAttempts: MAX_INSTRUCTOR_APPLICATIONS - existingApplication.submissionCount,
        },
      });
    }

    // First-time submission
    const application = await InstructorApplication.create({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      qualifications,
      experience,
      expertise: expertiseArray,
      bio,
      portfolio: portfolio || undefined,
      submissionCount: 1,
    });

    try {
      await mailSender(
        user.email,
        'Instructor Application Received — Academix',
        instructorApplicationEmailTemplate(user.firstName, 1)
      );
    } catch (e) {
      console.error('Instructor application email failed:', e.message);
    }

    return res.status(201).json({
      success: true,
      message: "Instructor application submitted successfully",
      data: {
        submissionCount: 1,
        remainingAttempts: MAX_INSTRUCTOR_APPLICATIONS - 1,
      },
    });
  } catch (error) {
    console.error("Submit instructor application error:", error);
    res.status(500).json({ success: false, message: "Failed to submit instructor application" });
  }
};
