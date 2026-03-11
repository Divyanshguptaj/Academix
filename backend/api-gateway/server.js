import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { createProxyMiddleware } from "http-proxy-middleware";

// Load .env from this service's own directory, regardless of what cwd is at startup
dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '.env') });

const app = express();
const PORT = process.env.PORT || 4000;

// Service URLs
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:4001";
const COURSE_SERVICE_URL = process.env.COURSE_SERVICE_URL || "http://localhost:4002";
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || "http://localhost:4003";
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:4004";

// Security headers
app.use(helmet());

// Gzip compression
app.use(compression());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));

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
  console.log(`[api-gateway] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API Gateway is running",
    timestamp: new Date().toISOString(),
  });
});

// Auth routes proxy
app.use(
  "/api/v1/auth",
  createProxyMiddleware({
    target: USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/auth${path}`,
  }),
);

// Profile routes proxy
app.use(
  "/api/v1/profile",
  createProxyMiddleware({
    target: USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/profile${path}`,
  }),
);

// Course routes proxy
app.use(
  "/api/v1/course",
  createProxyMiddleware({
    target: COURSE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/course${path}`,
  }),
);

// Payment routes proxy
app.use(
  "/api/v1/payment",
  createProxyMiddleware({
    target: PAYMENT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/payment${path}`,
  }),
);

// AI routes proxy
app.use(
  "/api/v1/smart-study",
  createProxyMiddleware({
    target: AI_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/smartStudy${path}`,
  }),
);

// Contact routes proxy
app.use(
  "/api/v1/contact",
  createProxyMiddleware({
    target: USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/contact${path}`,
  }),
);

// Admin routes — namespaced by service
app.use(
  "/api/v1/admin/payment",
  createProxyMiddleware({
    target: PAYMENT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/admin${path}`,
  }),
);

app.use(
  "/api/v1/admin/user",
  createProxyMiddleware({
    target: USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/admin${path}`,
  }),
);

app.use(
  "/api/v1/admin/course",
  createProxyMiddleware({
    target: COURSE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/admin${path}`,
  }),
);

app.use(
  "/api/v1/admin/ai",
  createProxyMiddleware({
    target: AI_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/admin${path}`,
  }),
);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('API Gateway Error:', err.stack);
  res.status(500).json({
    success: false,
    message: "Gateway error occurred",
  });
});

// Graceful shutdown — no DB to close, just drain in-flight requests
const server = app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});

const shutdown = () => {
  console.log('API Gateway: shutting down gracefully...');
  server.close(() => process.exit(0));
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
