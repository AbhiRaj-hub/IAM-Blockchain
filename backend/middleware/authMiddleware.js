const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protects routes by validating the JWT bearer token.
 * Attaches the authenticated user object to `req.user`.
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'sih2026_super_secret_jwt_key_for_development'
      );

      // Look up user from database without password field
      const userId = decoded.id || decoded._id;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User belonging to this token no longer exists.',
        });
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error('[AuthMiddleware] JWT verification error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, invalid or expired token.',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no bearer token provided.',
    });
  }
};

module.exports = { protect };
