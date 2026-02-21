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

    // Check token version - invalidated if user has logged out since this token was issued
    if (decoded.tokenVersion !== undefined && decoded.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({
        success: false,
        message: 'Session has been invalidated. Please log in again.'
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

// Role-based authorization factory.
// Usage: authorize('Student'), authorize('Admin'), authorize('Instructor', 'Admin')
export const authorize = (...roles) => async (req, res, next) => {
  await authenticateToken(req, res, () => {
    if (!roles.includes(req.user.accountType)) {
      return res.status(403).json({
        success: false,
        message: `Access restricted. Required role: ${roles.join(' or ')}`
      })
    }
    next()
  })
}

// Token invalidation for logout - increments tokenVersion so all existing tokens
// for this user stop working immediately
export const invalidateToken = async (req, res) => {
  try {
    // req.user is set by authenticateToken middleware that runs before this
    await User.findByIdAndUpdate(req.user._id, { $inc: { tokenVersion: 1 } })

    // Clear the cookie as well
    res.clearCookie('token')

    return res.status(200).json({ success: true, message: 'Logged out successfully' })
  } catch (error) {
    console.error('Token invalidation error:', error)
    res.status(500).json({ success: false, message: 'Logout failed' })
  }
}

