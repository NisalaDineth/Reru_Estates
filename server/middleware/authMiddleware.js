// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Protect routes - verify token is valid
const protect = async (req, res, next) => {
  console.log('Auth headers:', req.headers);
  const authHeader = req.header('Authorization');
  console.log('Auth header:', authHeader);
  
  const token = authHeader && authHeader.split(' ')[1]; // Bearer token
  console.log('Token:', token);

  if (!token) {
    console.error('No token provided');
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    console.log('Verifying token...');
    const decoded = jwt.verify(token, 'your_jwt_secret');
    console.log('Decoded token:', decoded);
    
    // Check if user is customer and verify isActive status
    if (decoded.role === 'customer') {
      console.log('Verifying customer status...');
      const [rows] = await pool.query('SELECT isActive FROM customer WHERE id = ?', [decoded.id]);
      if (!rows.length) {
        return res.status(401).json({ error: 'User not found.' });
      }
      
      if (rows[0].isActive === 0) {
        return res.status(403).json({ error: 'Your account has been deactivated. Please contact support.' });
      }
    }

    req.user = decoded; // Attach user info to request
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Staff only middleware
const staffOnly = (req, res, next) => {
  if (req.user && req.user.role === 'staff') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Staff only.' });
  }
};

// Owner only middleware
const ownerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'owner') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Owner only.' });
  }
};

module.exports = { protect, staffOnly, ownerOnly };
