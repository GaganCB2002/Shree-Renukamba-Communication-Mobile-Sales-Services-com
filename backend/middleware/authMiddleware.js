const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { pool } = require('../config/db');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

      const session = await pool.query(
        `SELECT is_valid FROM sessions WHERE token = $1 AND expires_at > datetime('now') AND is_valid = 1`,
        [token]
      );

      if (session.rows && session.rows.length === 0) {
        return res.status(401).json({ message: 'Session expired, please login again' });
      }

      req.user = await User.findById(decoded.id).select('-password');

      if (session.rows && session.rows.length > 0) {
        await pool.query(
          `UPDATE sessions SET last_activity = datetime('now') WHERE token = $1`,
          [token]
        );
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

const technician = (req, res, next) => {
  if (req.user && (req.user.role === 'technician' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as a technician' });
  }
};

module.exports = { protect, admin, technician };
