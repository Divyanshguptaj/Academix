import mongoose from "mongoose";

const courseProgressSchema = new mongoose.Schema({
  courseID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // make sure this matches your actual User model name
  },
  completedVideos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubSection",
    },
  ],
});

// ✅ Prevent OverwriteModelError in dev
const CourseProgress =
  mongoose.models.CourseProgress ||
  mongoose.model("CourseProgress", courseProgressSchema);

export default CourseProgress;
