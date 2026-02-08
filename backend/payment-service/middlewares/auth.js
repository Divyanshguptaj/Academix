import jwt from 'jsonwebtoken'
import User from '../../user-service/models/User.js'

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
    res.status(500).json({
      success: false,
      message: 'Admin authentication failed'
    })
  }
}