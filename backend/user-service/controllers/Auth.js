import User from "../models/User.js";
import OTP from "../models/OTP.js";
import otpgenerator from "otp-generator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Profile from "../models/Profile.js";
import mongoose from "mongoose";

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
      email,
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
      image: picture ? picture.replace('=s96-c', '=s200-c') : `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    // console.log(`New user created: ${user._id}`);

    // Generate token
    const payload = {
      email: user.email,
      id: user._id,
      accountType: user.accountType,
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
