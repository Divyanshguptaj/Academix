import express from "express";
import fileUpload from "express-fileupload";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import mongoose from "mongoose";
import userRoutes from "./routes/User.js";
import profileRoutes from "./routes/Profile.js";
import resetPasswordRoutes from "./routes/ResetPassword.js";
import contactRoutes from "./routes/Contact.js";
import adminRoutes from "./routes/admin.js";
import database from "./config/database.js";
import { validateEnv } from "../shared-utils/validateEnv.js";

// Load .env from this service's own directory, regardless of what cwd is at startup
dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '.env') });

// Fail fast if required env vars are missing
validateEnv(
  ['MONGODB_URL', 'JWT_SECRET', 'MAIL_HOST', 'MAIL_USER', 'MAIL_PASS', 'ADMIN_MAIL'],
  'user-service'
);

const app = express();
const PORT = process.env.PORT || 4001;

await database();
mongoose.connection.once("open", async () => {
  const db = mongoose.connection.getClient().db("StudyNotion");
  const collections = await db.listCollections().toArray();
  console.log("Collections:", collections.map(c => c.name));
});

// Security headers
app.use(helmet());

// Gzip compression
app.use(compression());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:4000'],
  credentials: true,
}));

// File upload — must be before routes; useTempFiles required by Cloudinary uploader (uses file.tempFilePath)
app.use(fileUpload({ useTempFiles: true, tempFileDir: '/tmp/' }));

// Body parsing & cookies
app.use(express.json());
app.use(cookieParser());

// Request timeout — 30s for normal requests; skip for multipart (file/video uploads)
app.use((req, res, next) => {
  if (req.is('multipart/form-data')) return next();
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(408).json({ success: false, message: 'Request timeout' });
    }
  }, 30000);
  res.on('finish', () => clearTimeout(timeout));
  res.on('close', () => clearTimeout(timeout));
  next();
});

// Request logging
app.use((req, res, next) => {
  console.log(`[user-service] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/auth", userRoutes);
app.use("/profile", profileRoutes);
app.use("/resetPassword", resetPasswordRoutes);
app.use("/contact", contactRoutes);
app.use("/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({ success: true, message: "User Service is running" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('User Service Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Graceful shutdown — finish in-flight requests before exiting
const server = app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});

const shutdown = () => {
  console.log('User Service: shutting down gracefully...');
  server.close(() => {
    mongoose.disconnect();
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
