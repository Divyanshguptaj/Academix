import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { createProxyMiddleware } from "http-proxy-middleware";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Service URLs
const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL || "http://localhost:4001";
const COURSE_SERVICE_URL =
  process.env.COURSE_SERVICE_URL || "http://localhost:4002";
const PAYMENT_SERVICE_URL =
  process.env.PAYMENT_SERVICE_URL || "http://localhost:4003";
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:4004";

// Middleware
app.use(cookieParser());
app.use(
  cors({
    origin: [process.env.CORS_ORIGIN, "http://localhost:3000"],
    credentials: true,
  }),
);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API Gateway is running",
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res, next) => {
  console.log("🔥 GATEWAY RECEIVED:", req.method, req.url);
  next();
});

// Auth routes proxy
app.use(
  "/api/v1/auth",
  createProxyMiddleware({
    target: USER_SERVICE_URL,
    changeOrigin: true,

    pathRewrite: (path, req) => {
      const newPath = `/auth${path}`;
      console.log("🔁 Rewriting path:", path, "→", newPath);
      return newPath;
    },
  }),
);

// Profile routes proxy
app.use(
  "/api/v1/profile",
  createProxyMiddleware({
    target: USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path, req) => {
      const newPath = `/profile${path}`;
      console.log("🔁 Rewriting path:", path, "→", newPath);
      return newPath;
    },
  }),
);

// Course routes proxy
app.use(
  "/api/v1/course",
  createProxyMiddleware({
    target: COURSE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path, req) => {
      const newPath = `/course${path}`;
      console.log("🔍 API GATEWAY: Forwarding course request:", {
        originalPath: path,
        rewrittenPath: newPath,
        target: COURSE_SERVICE_URL
      });
      return newPath;
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log("🔍 API GATEWAY: Proxy request headers:", proxyReq.getHeaders());
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log("🔍 API GATEWAY: Proxy response status:", proxyRes.statusCode);
      console.log("🔍 API GATEWAY: Proxy response headers:", proxyRes.headers);
    }
  }),
);

// Payment routes proxy
app.use(
  "/api/v1/payment",
  createProxyMiddleware({
    target: PAYMENT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path, req) => {
      const newPath = `/payment${path}`;
      console.log('🔁 Rewriting path:', path, '→', newPath);
      return newPath;
    },
  }),
);

// AI routes proxy
app.use(
  "/api/v1/smart-study",
  createProxyMiddleware({
    target: AI_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path, req) => {
      const newPath = `/smartStudy${path}`;
      console.log('🔁 Rewriting path:', path, '→', newPath);
      return newPath;
    },
  }),
);

// Contact routes proxy
app.use(
  "/api/v1/contact",
  createProxyMiddleware({
    target: USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path, req) => {
      const newPath = `/contact${path}`;
      console.log("🔁 Rewriting path:", path, "→", newPath);
      return newPath;
    },
  }),
);

// Error handling
app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: "Gateway error occurred",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📍 Services configured:`);
  console.log(`   User: ${USER_SERVICE_URL}`);
  console.log(`   Course: ${COURSE_SERVICE_URL}`);
  console.log(`   Payment: ${PAYMENT_SERVICE_URL}`);
  console.log(`   AI: ${AI_SERVICE_URL}`);
});
