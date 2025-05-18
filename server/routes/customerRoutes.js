// backend/routes/ownerRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db'); // adjust if db path differs
const verifyToken = require('../middleware/verifyToken'); // adjust path if needed

// Route: GET /api/owner/customer-growth
router.get('/customer-growth', verifyToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        DATE_FORMAT(SignUpDate, '%Y-%m') AS month,
        COUNT(*) AS customerCount
      FROM customer
      WHERE isActive = 1
      GROUP BY month
      ORDER BY month ASC;
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching customer growth:', err);
        return res.status(500).json({ error: 'Failed to fetch customer growth' });
      }

      res.json(results);
    });
  } catch (error) {
    console.error('Error in route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
