// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const authenticate = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1]; // Bearer token

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    
    // Check if user is customer and verify isActive status
    if (decoded.role === 'customer') {
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

module.exports = authenticate;
