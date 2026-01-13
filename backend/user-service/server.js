import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import userRoutes from './routes/User.js';
import profileRoutes from './routes/Profile.js';
import resetPasswordRoutes from './routes/ResetPassword.js';
import database from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;

// Connect to database
database();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://academix-w1rw.onrender.com",
    "https://academix-sigma.vercel.app"
  ],
  methods: "GET,POST,PUT,DELETE",
  credentials: true,
}));

// Routes
app.use('/auth', userRoutes);
app.use('/profile', profileRoutes);
app.use('/resetPassword', resetPasswordRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'User Service is running',
    port: PORT
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('User Service Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});
