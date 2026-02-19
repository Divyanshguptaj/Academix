import { body, validationResult } from 'express-validator'
import mongoSanitize from 'express-mongo-sanitize'
import rateLimit from 'express-rate-limit'

// Sanitize input by trimming whitespace
export const sanitizeInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim()
      }
    })
  }
  next()
}

// Handle validation errors from express-validator
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    })
  }
  next()
}

// MongoDB injection protection middleware
export const mongoSanitizeMiddleware = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ key }) => {
    console.warn(`Sanitized potentially malicious input: ${key}`)
  }
})

// Create rate limiter for different endpoints
export const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
  })
}

// Validation rules for profile updates
export const validateProfileUpdate = [
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('firstName').optional().isLength({ min: 1, max: 50 }).withMessage('First name must be 1-50 characters'),
  body('lastName').optional().isLength({ min: 1, max: 50 }).withMessage('Last name must be 1-50 characters'),
  body('contactNumber').optional().matches(/^[0-9]{10}$/).withMessage('Contact number must be 10 digits'),
  body('dateOfBirth').optional().isISO8601().withMessage('Invalid date format'),
  body('gender').optional().isIn(['Male', 'Female', 'Other', 'Prefer not to say']).withMessage('Invalid gender'),
  body('about').optional().isLength({ max: 500 }).withMessage('About section must be less than 500 characters'),
  handleValidationErrors
]

// Validation rules for signup
export const validateSignup = [
  body('firstName').notEmpty().withMessage('First name is required').isLength({ min: 1, max: 50 }),
  body('lastName').notEmpty().withMessage('Last name is required').isLength({ min: 1, max: 50 }),
  body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('accountType').optional().isIn(['Student', 'Instructor', 'Admin']).withMessage('Invalid account type'),
  handleValidationErrors
]

// Validation rules for login
export const validateLogin = [
  body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
]

// Validation rules for contact form
export const validateContactForm = [
  body('firstName').notEmpty().withMessage('First name is required').isLength({ min: 1, max: 50 }),
  body('lastName').notEmpty().withMessage('Last name is required').isLength({ min: 1, max: 50 }),
  body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
  body('message').notEmpty().withMessage('Message is required').isLength({ min: 10, max: 1000 }).withMessage('Message must be 10-1000 characters'),
  body('phoneNo').optional().matches(/^[0-9]{10}$/).withMessage('Phone number must be 10 digits'),
  handleValidationErrors
]

// Validation rules for password reset
export const validatePasswordReset = [
  body('password').notEmpty().withMessage('Password is required').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('confirmPassword').notEmpty().withMessage('Confirm password is required').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match')
    }
    return true
  }),
  handleValidationErrors
]
