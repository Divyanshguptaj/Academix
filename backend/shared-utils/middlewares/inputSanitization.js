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

// Create rate limiter — params: max requests, window in ms
// e.g. createRateLimit(5, 15 * 60 * 1000) → 5 requests per 15 minutes
export const createRateLimit = (max = 100, windowMs = 15 * 60 * 1000) => {
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

// ─── Validation rule sets ─────────────────────────────────────────────────────
// Each array can be spread directly into a route: router.post('/path', ...validateSignup, handler)
// or passed as a single middleware array: router.post('/path', validateSignup, handler)

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

export const validateSignup = [
  body('firstName').notEmpty().withMessage('First name is required').isLength({ min: 1, max: 50 }),
  body('lastName').notEmpty().withMessage('Last name is required').isLength({ min: 1, max: 50 }),
  body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('accountType').optional().isIn(['Student', 'Instructor', 'Admin']).withMessage('Invalid account type'),
  handleValidationErrors
]

export const validateLogin = [
  body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
]

// Validates the email sent to /reset-password-token to request a reset link
export const validatePasswordReset = [
  body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
  handleValidationErrors
]

// Validates the new password submitted to /reset-password
export const validatePasswordResetConfirm = [
  body('password').notEmpty().withMessage('Password is required').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('confirmPassword').notEmpty().withMessage('Confirm password is required').custom((value, { req }) => {
    if (value !== req.body.password) throw new Error('Passwords do not match')
    return true
  }),
  handleValidationErrors
]

// Validates current + new password for logged-in users changing their password
export const validatePasswordChange = [
  body('oldPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').notEmpty().withMessage('New password is required').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  body('confirmNewPassword').notEmpty().withMessage('Confirm password is required').custom((value, { req }) => {
    if (value !== req.body.newPassword) throw new Error('Passwords do not match')
    return true
  }),
  handleValidationErrors
]

// Validates the email field when requesting an OTP
export const validateOTP = [
  body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
  handleValidationErrors
]

// Validates the Google credential token from the OAuth flow
export const validateGoogleAuth = [
  body('credential').notEmpty().withMessage('Google credential token is required'),
  handleValidationErrors
]

export const validateContactForm = [
  body('firstName').notEmpty().withMessage('First name is required').isLength({ min: 1, max: 50 }),
  body('lastName').notEmpty().withMessage('Last name is required').isLength({ min: 1, max: 50 }),
  body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
  body('message').notEmpty().withMessage('Message is required').isLength({ min: 10, max: 1000 }).withMessage('Message must be 10-1000 characters'),
  body('phoneNo').optional().matches(/^[0-9]{10}$/).withMessage('Phone number must be 10 digits'),
  handleValidationErrors
]
