import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Service URLs
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:4001';
const COURSE_SERVICE_URL = process.env.COURSE_SERVICE_URL || 'http://localhost:4002';
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:4003';
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:4004';

// Middleware
app.use(cookieParser());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Gateway is running',
    services: {
      user: USER_SERVICE_URL,
      course: COURSE_SERVICE_URL,
      payment: PAYMENT_SERVICE_URL,
      ai: AI_SERVICE_URL
    }
  });
});

// Route all requests to appropriate services
app.use(
  "/api/v1/auth",
  createProxyMiddleware({
    target: USER_SERVICE_URL,
    changeOrigin: true,
    timeout: 30000,
    proxyTimeout: 30000,

    /**
     * 🔁 Rewrite:
     * Incoming: /api/v1/auth/login
     * Forwarded: /auth/login
     */
    pathRewrite: (path, req) => {
      return `/auth${path}`; // path === "/login"
    },

    /**
     * 📦 Forward request body
     */
    onProxyReq: (proxyReq, req, res) => {
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader("Content-Type", "application/json");
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },

    /**
     * 📥 Response log (debug only)
     */
    onProxyRes: (proxyRes, req, res) => {
      console.log(`[GATEWAY] Auth response: ${proxyRes.statusCode}`);
    },

    /**
     * ❌ Error handler
     */
    onError: (err, req, res) => {
      console.error("[GATEWAY] Proxy error:", err.message);
      res.status(500).json({
        success: false,
        message: "User service unavailable",
      });
    },
  })
);

app.use('/api/v1/profile', createProxyMiddleware({
  target: USER_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/profile': '/profile'
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying profile request: ${req.method} ${req.originalUrl}`);
  }
}));

app.use('/api/v1/course', createProxyMiddleware({
  target: COURSE_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/course': '/course'
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying course request: ${req.method} ${req.originalUrl}`);
  }
}));

app.use('/api/v1/payment', createProxyMiddleware({
  target: PAYMENT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/payment': '/payment'
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying payment request: ${req.method} ${req.originalUrl}`);
  }
}));

app.use('/api/v1/smart-study', createProxyMiddleware({
  target: AI_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/smart-study': '/smartStudy'
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying smart-study request: ${req.method} ${req.originalUrl}`);
  }
}));

// Contact route (handled locally)
import contactRoutes from './routes/Contact.js';
app.use('/api/v1/contact', contactRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Gateway Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Gateway error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Services:`);
  console.log(`  User Service: ${USER_SERVICE_URL}`);
  console.log(`  Course Service: ${COURSE_SERVICE_URL}`);
  console.log(`  Payment Service: ${PAYMENT_SERVICE_URL}`);
  console.log(`  AI Service: ${AI_SERVICE_URL}`);
});
