import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import paymentRoutes from './routes/Payments.js';
import database from './config/database.js';
import adminRoutes from './routes/admin.js';
import { validateEnv } from '../shared-utils/validateEnv.js';

dotenv.config();

// Fail fast if required env vars are missing
validateEnv(
  ['MONGODB_URL', 'JWT_SECRET', 'RAZORPAY_KEY', 'RAZORPAY_SECRET'],
  'payment-service'
);

const app = express();
const PORT = process.env.PORT || 4003;

// Connect to database
await database();

// Security headers
app.use(helmet());

// Gzip compression
app.use(compression());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:4000'],
  credentials: true,
}));

// Body parsing & cookies
app.use(express.json());
app.use(cookieParser());

// Request timeout — return 408 if a request hangs for more than 30s
app.use((req, res, next) => {
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
  console.log(`[payment-service] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/payment', paymentRoutes);
app.use('/admin', adminRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Payment Service is running',
    port: PORT
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Payment Service Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Graceful shutdown — finish in-flight requests before exiting
const server = app.listen(PORT, () => {
  console.log(`Payment Service running on port ${PORT}`);
});

const shutdown = () => {
  console.log('Payment Service: shutting down gracefully...');
  server.close(() => {
    mongoose.disconnect();
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
