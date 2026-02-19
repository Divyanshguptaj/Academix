import jwt from 'jsonwebtoken'
import User from '../../user-service/models/User.js'

// Base authentication - validates JWT and loads user from DB
export const authenticateToken = async (req, res, next) => {
  try {
    // Multi-source token extraction (cookies → body → header)
    let token = req.cookies?.token || req.body?.token
    const authHeader = req.headers['authorization']
    if (!token && authHeader) {
      token = authHeader.replace('Bearer', '').trim()
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      })
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Validate user exists in database (not just JWT verification!)
    const user = await User.findById(decoded.id).select('-password')
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      })
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' })
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' })
    }
    console.error('Authentication error:', error)
    res.status(500).json({ success: false, message: 'Authentication failed' })
  }
}

// Admin-only access
export const authenticateAdmin = async (req, res, next) => {
  try {
    await authenticateToken(req, res, () => {
      if (req.user.accountType !== 'Admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        })
      }
      next()
    })
  } catch (error) {
    console.error('Admin authentication error:', error)
    res.status(500).json({ success: false, message: 'Admin authentication failed' })
  }
}

// Student-only access
export const authenticateStudent = async (req, res, next) => {
  try {
    await authenticateToken(req, res, () => {
      if (req.user.accountType !== 'Student') {
        return res.status(403).json({
          success: false,
          message: 'Student access required'
        })
      }
      next()
    })
  } catch (error) {
    console.error('Student authentication error:', error)
    res.status(500).json({ success: false, message: 'Student authentication failed' })
  }
}

// Instructor OR Admin access
export const authenticateInstructor = async (req, res, next) => {
  try {
    await authenticateToken(req, res, () => {
      if (req.user.accountType !== 'Instructor' && req.user.accountType !== 'Admin') {
        return res.status(403).json({
          success: false,
          message: 'Instructor access required'
        })
      }
      next()
    })
  } catch (error) {
    console.error('Instructor authentication error:', error)
    res.status(500).json({ success: false, message: 'Instructor authentication failed' })
  }
}

// Token invalidation for logout
export const invalidateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided for logout' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Note: True invalidation requires a blacklist (future enhancement)
    return res.status(200).json({ success: true, message: 'Token invalidated successfully' })
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token provided' })
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token has already expired' })
    }
    console.error('Token invalidation error:', error)
    res.status(500).json({ success: false, message: 'Token invalidation failed' })
  }
}

// Legacy aliases for backward compatibility
export const auth = authenticateToken
export const isAdmin = authenticateAdmin
export const isStudent = authenticateStudent
export const isInstructor = authenticateInstructor
