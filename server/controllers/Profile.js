import { uploadImagetoCloudinary } from "../utils/imageUploader.js";
import Profile from "../models/Profile.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import cloudinary from 'cloudinary';

export const getUserDetails = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const userDetails = await User.findOne({ email }).populate(
      "additionalDetails"
    );

    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true, // Fixed typo
      userDetails,
      message: "User found",
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const {
      email,
      dateOfBirth,
      about,
      contactNumber,
      gender,
      firstName,
      lastName,
    } = req.body;
    console.log(
      email,
      dateOfBirth,
      about,
      contactNumber,
      gender,
      firstName,
      lastName
    );
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    // Fetch user details along with additional profile details
    const userDetails = await User.findOne({ email }).populate(
      "additionalDetails"
    );
    console.log(userDetails);
    if (!userDetails) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    await User.findOneAndUpdate(
      { email },
      { $set: { firstName, lastName } },
      { new: true }
    );

    // Get profile ID from user's additional details
    const profileId = userDetails.additionalDetails;
    if (!profileId) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }

    // Create an update object and add only provided fields
    const updateFields = {};
    if (dateOfBirth) updateFields.dateOfBirth = new Date(dateOfBirth);
    if (about) updateFields.about = about;
    if (contactNumber) updateFields.contactNumber = contactNumber;
    if (gender) updateFields.gender = gender;
    // Update the profile only if there are fields to update
    if (Object.keys(updateFields).length > 0) {
      await Profile.findByIdAndUpdate(profileId, updateFields, { new: true });
    }

    return res
      .status(200)
      .json({
        success: true,
        message: "everything for profile updated successfully",
      });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided",
      });
    }

    // Verify token and get user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Find user by ID
    const userDetails = await User.findById(userId);
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete associated profile
    const profileId = userDetails.additionalDetails;
    if (profileId) {
      await Profile.findByIdAndDelete(profileId);
    }

    // Delete user account
    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete Account Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error: Unable to delete account",
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const users = await User.findById(userId)
      .populate("additionalDetails")
      .exec();
    return res.status(200).json({
      success: true,
      message: "All Users...",
      data: users,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Can't get all users, some error occured ...",
    });
  }
};

export const getEnrolledCourses = async (req, res) => {
  try {
    const { userId } = req.query;
    // Fetch user and populate enrolled courses
    const user = await User.findById(userId).populate({
      path: "courses", // Populate the courses array
      populate: {
        path: "courseContent", // Inside courses, populate courseContent (sections)
        populate: {
          path: "subSection", // Inside courseContent, populate subsections
        },
      },
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const coursesWithDuration = user.courses.map((course) => {
      let totalDuration = 0;

      course.courseContent.forEach((section) => {
        section.subSection.forEach((sub) => {
          const duration = parseFloat(sub.timeDuration) || 0;
          totalDuration += duration;
        });
      });

      return {
        ...course._doc,
        totalDurationInMinutes: totalDuration,
      };
    });

    return res.status(200).json({
      success: true,
      data: coursesWithDuration,
    });
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    return res.status(500).json({
      success: false,
      message: "Can't fetch the enrolled courses",
      error: error.message,
    });
  }
};

export const instructorDetails = async (req, res) => {
  try {
    const { userId } = req.query;
    // Validate presence
    if (!userId || typeof userId !== "string" || userId.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid userId in request.",
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId format.",
      });
    }

    // Fetch instructor with populated fields
    const instructor = await User.findOne({
      _id: userId.trim(),
      accountType: "Instructor",
    })
      .populate("additionalDetails")
      .populate({
        path: "courses",
        select: "courseName courseDescription price studentsEnrolled thumbnail",
      });

    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: "Instructor not found",
      });
    }

    // If instructor exists but has no courses
    if (!instructor.courses || instructor.courses.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Instructor found, but no courses available yet.",
        instructor: {
          ...instructor.toObject(),
          courses: [],
        },
      });
    }

    // If instructor and courses found
    return res.status(200).json({
      success: true,
      message: "Instructor data fetched successfully.",
      instructor,
    });
  } catch (error) {
    console.error("Error fetching instructor details:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while fetching instructor details",
    });
  }
};

export const updateDisplayPicture = async (req, res) => {
  try {
    const { email } = req.body;
    const imageFile = req.files?.displayPicture;

    // 1. Validate email
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // 2. Check if user exists
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 3. Validate file
    if (!imageFile) {
      return res.status(400).json({ success: false, message: "No image file uploaded" });
    }

    // Save old image URL before updating
    const oldImageUrl = existingUser.image;

    // 4. Upload new image
    const uploadedImage = await uploadImagetoCloudinary(
      imageFile,
      process.env.FOLDER_NAME
    );

    // 5. Update user with new image
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { image: uploadedImage.secure_url },
      { new: true }
    ).populate("additionalDetails");

    // 6. Delete old image from Cloudinary (if it exists)
    if (oldImageUrl) {
      try {
        // Extract the public_id including folder name
        const publicId = oldImageUrl
          .split("/")
          .slice(-2) // gets [folderName, filename]
          .join("/")
          .split(".")[0]; // remove file extension

        await cloudinary.v2.uploader.destroy(publicId, {
          resource_type: "image",
        });

        console.log(`Old image deleted from Cloudinary: ${publicId}`);
      } catch (deleteErr) {
        console.warn("Failed to delete old image from Cloudinary:", deleteErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Display picture updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("updateDisplayPicture error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};