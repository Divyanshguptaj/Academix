import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
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
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      })
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      })
    }
    
    console.error('Authentication error:', error)
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    })
  }
}

export const authenticateAdmin = async (req, res, next) => {
  try {
    console.log('Authenticating admin for request:', req.user)
    await authenticateToken(req, res, () => {
      if (req.user.accountType !== 'Admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        })
      }
      console.log('Admin authenticated:', req.user.email)
      next()
    })
  } catch (error) {
    console.error('Admin authentication error:', error)
    res.status(500).json({
      success: false,
      message: 'Admin authentication failed'
    })
  }
}

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
    res.status(500).json({
      success: false,
      message: 'Instructor authentication failed'
    })
  }
}

export const invalidateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided for logout'
      })
    }

    // Verify the token is valid before "invalidating" it
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // For JWT tokens, true invalidation requires a blacklist or database storage
    // For now, we'll return success and let the frontend handle token removal
    return res.status(200).json({
      success: true,
      message: 'Token invalidated successfully'
    })
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token provided'
      })
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has already expired'
      })
    }
    
    console.error('Token invalidation error:', error)
    res.status(500).json({
      success: false,
      message: 'Token invalidation failed'
    })
  }
}
