import { body, validationResult } from 'express-validator';
import validator from 'validator';
import mongoSanitize from 'express-mongo-sanitize';

// Input sanitization middleware
export const sanitizeInput = (req, res, next) => {
  // Sanitize all string inputs
  for (const [key, value] of Object.entries(req.body)) {
    if (typeof value === 'string') {
      // Escape HTML characters to prevent XSS
      req.body[key] = validator.escape(value.trim());
    }
  }

  // Sanitize query parameters
  for (const [key, value] of Object.entries(req.query)) {
    if (typeof value === 'string') {
      req.query[key] = validator.escape(value.trim());
    }
  }

  // Sanitize URL parameters
  for (const [key, value] of Object.entries(req.params)) {
    if (typeof value === 'string') {
      req.params[key] = validator.escape(value.trim());
    }
  }

  next();
};

// MongoDB sanitization middleware using express-mongo-sanitize
export const mongoSanitizeMiddleware = mongoSanitize({
  onSanitize: ({ req, key }) => {
    console.warn(`Sanitized ${key} in MongoDB query for request from ${req.ip}`);
  }
});

// Validation rules for signup
export const validateSignup = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),

  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),

  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email address too long'),

  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),

  body('contactNumber')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),

  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers'),
];

// Validation rules for login
export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Validation rules for password change
export const validatePasswordChange = [
  body('oldPassword')
    .notEmpty()
    .withMessage('Old password is required'),

  body('newPassword')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

  body('mail')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
];

// Validation rules for OTP
export const validateOTP = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
];

// Validation rules for Google Auth
export const validateGoogleAuth = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),

  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),

  body('mode')
    .isIn(['login', 'signup'])
    .withMessage('Mode must be either login or signup'),

  body('accountType')
    .optional()
    .isIn(['Student', 'Instructor', 'Admin'])
    .withMessage('Account type must be Student, Instructor, or Admin'),
];

// Validation rules for password reset
export const validatePasswordReset = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
];

export const validatePasswordResetConfirm = [
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),

  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
];

// Error handling middleware
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.param,
      message: error.msg
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }

  next();
};

// Additional security middleware - Rate limiting helper
export const createRateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();

  return (req, res, next) => {
    const key = req.ip + (req.body.email || req.body.phone || '');
    const now = Date.now();
    
    // Clean up old entries
    if (attempts.has(key)) {
      const userAttempts = attempts.get(key);
      const validAttempts = userAttempts.filter(time => now - time < windowMs);
      attempts.set(key, validAttempts);
    }

    const currentAttempts = attempts.get(key) || [];
    
    if (currentAttempts.length >= maxAttempts) {
      return res.status(429).json({
        success: false,
        message: 'Too many attempts. Please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    currentAttempts.push(now);
    attempts.set(key, currentAttempts);
    
    next();
  };
};

// Validation rules for profile updates
export const validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),

  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),

  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),

  body('about')
    .optional()
    .isLength({ max: 500 })
    .withMessage('About section cannot exceed 500 characters'),

  body('contactNumber')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
];

// Validation rules for course operations
export const validateCourseOperation = [
  body('courseId')
    .notEmpty()
    .withMessage('Course ID is required')
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage('Invalid course ID format'),
];
