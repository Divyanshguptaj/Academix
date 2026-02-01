import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import courseRoutes from './routes/Course.js';
import database from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4002;

// Connect to database
database();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: [
    "http://localhost:4000",
    "https://academix-w1rw.onrender.com",
    "https://academix-sigma.vercel.app"
  ],
  methods: "GET,POST,PUT,DELETE",
  credentials: true,
}));

app.use((req, res, next) => {
  console.log('🔥 GATEWAY RECEIVED:', req.method, req.url);
  next();
});

// Routes
app.use('/course', courseRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Course Service is running',
    port: PORT
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Course Service Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

app.listen(PORT, () => {
  console.log(`Course Service running on port ${PORT}`);
});
