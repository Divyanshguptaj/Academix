import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let isConnected = false;

const connect = async () => {
  if (isConnected) {
    console.log("MongoDB already connected, reusing existing connection");
    return;
  }

  try {
    console.log("Connecting to MongoDB:", process.env.MONGODB_URL);

    await mongoose.connect(process.env.MONGODB_URL, {
      dbName: "StudyNotion",
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      bufferCommands: false,
    });

    isConnected = true;
    console.log("MongoDB connected successfully");
    console.log("DB Name:", mongoose.connection.name);
    console.log("ReadyState:", mongoose.connection.readyState);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      isConnected = false;
    });

  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  }
};

export default connect;
