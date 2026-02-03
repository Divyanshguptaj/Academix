import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import userRoutes from "./routes/User.js";
import profileRoutes from "./routes/Profile.js";
import resetPasswordRoutes from "./routes/ResetPassword.js";
import contactRoutes from "./routes/Contact.js";
import database from "./config/database.js";
import mongoose from "mongoose";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;

console.log("Attempting to connect to MongoDB with URL:", process.env.MONGODB_URL);
await database();
mongoose.connection.once("open", async () => {
  const db = mongoose.connection.getClient().db("StudyNotion");
  const collections = await db.listCollections().toArray();
  console.log(collections.map(c => c.name));
});

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/auth", userRoutes);
app.use("/profile", profileRoutes);
app.use("/resetPassword", resetPasswordRoutes);
app.use("/contact", contactRoutes);

app.get("/", (req, res) => {
  res.json({ success: true, message: "User Service is running" });
});

app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});
