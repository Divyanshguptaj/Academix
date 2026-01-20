import User from "../models/User.js";
import OTP from "../models/OTP.js";
import otpgenerator from "otp-generator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Profile from "../models/Profile.js";

//Send OTP -
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    // console.log(email);
    const checkUserPresent = await User.findOne({ email });
    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "User already exists! , Please go and try for login ...",
      });
    }
    // console.log("check present" , checkUserPresent)
    let otp;
    let result;

    do {
      otp = otpgenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });

      result = await OTP.findOne({ otp: otp });
    } while (result);

    // console.log(result)
    // console.log("OTP generated succesfully",otp);
    const otpPayload = { email, otp };
    await OTP.create(otpPayload);
    // console.log(otpPayload);
    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      otp,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error occured at generating otp",
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
        message: "All fields are mandatory...",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords are not same",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const recentOTP = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);

    if (recentOTP.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Can't fetch otp",
      });
    }

    if (otp !== recentOTP[0].otp) {
      return res.status(400).json({
        success: false,
        message: "OTP not matched",
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
    
    console.log("Login attempt - Email:", email, "Password length:", password ? password.length : 0);

    // Test database connection
    try {
      await User.findOne({}).limit(1); // Just test if DB is accessible
      console.log("Database connection test passed");
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return res.status(500).json({
        success: false,
        message: "Database connection failed",
      });
    }

    const user = await User.findOne({ email: email });
    console.log("User query result:", user ? "User found" : "User NOT found");
    console.log("User details:", user ? { id: user._id, email: user.email, firstName: user.firstName } : null);

    // Let's also check if there are any users in the database
    const totalUsers = await User.countDocuments();
    console.log("Total users in database:", totalUsers);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User doesn't exists",
      });
    }
    console.log("kya backchodi chal rahi hai ")
    //jwt token generation -
    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });
      user.token = token;
      user.password = undefined;

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      return res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "Logged and cookie created successfully ...",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Password doesn't match",
      });
    }
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
  console.log("Google Auth called with body:", req.body);
  try {
    const { firstName, lastName, email, password, image, mode } = req.body;
    console.log("Extracted data:", { firstName, lastName, email, password: password ? "present" : "missing", image, mode });

    // Validation - require basic fields
    if (!firstName || !lastName || !email) {
      console.log("Validation failed: missing required fields");
      return res.status(403).json({
        success: false,
        message: "First name, last name, and email are mandatory",
      });
    }

    // For login mode, password is not required
    if (mode !== 'login' && !password) {
      console.log("Validation failed: password required for non-login modes");
      return res.status(403).json({
        success: false,
        message: "Password is required",
      });
    }

    console.log("Validation passed");

    // Check if user already exists
    console.log("Checking for existing user with email:", email);
    const existingUser = await User.findOne({ email });
    console.log("Existing user found:", existingUser ? "yes" : "no");

    if (existingUser) {
      console.log("Logging in existing user");
      // User exists, login them (works for both local and Google users)
      const payload = {
        email: existingUser.email,
        id: existingUser._id,
        accountType: existingUser.accountType,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });
      existingUser.password = undefined;
      existingUser.token = token;

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      console.log("Sending success response for existing user");
      return res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user: existingUser,
        message: "Logged in successfully with Google",
      });
    }

    // User doesn't exist
    if (mode === 'login') {
      console.log("User not found during login attempt");
      return res.status(404).json({
        success: false,
        message: "User not found. Please sign up first.",
      });
    }

    // For signup mode, create new user
    console.log("Creating new user");

    // Validate password for signup
    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    if (!/\d/.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must include at least one number",
      });
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must include at least one special character",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password hashed");

    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });
    console.log("Profile created:", profileDetails._id);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      authProvider: 'google',
      additionalDetails: profileDetails._id,
      image: image || `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });
    console.log("User created:", user._id);

    // Generate JWT
    const payload = {
      email: user.email,
      id: user._id,
      accountType: user.accountType,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    user.token = token;
    user.password = undefined;

    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };
    console.log("Sending success response for new user");
    return res.cookie("token", token, options).status(200).json({
      success: true,
      token,
      user,
      message: "Account created and logged in successfully with Google",
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).json({
      success: false,
      message: "Google authentication failed",
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
