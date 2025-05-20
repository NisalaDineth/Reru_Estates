const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// Function to verify owner role
const verifyOwnerRole = (user) => {
    if (!user) return { error: 'Authentication required', status: 401 };
    if (user.role !== 'owner') return { error: 'Access denied. Owner only', status: 403 };
    return null;
};

// Middleware to check if user is owner
const ownerOnly = (req, res, next) => {
    console.log('Checking owner authorization:', {
        user: req.user,
        headers: req.headers,
        token: req.headers.authorization
    });

    const verificationResult = verifyOwnerRole(req.user);
    if (verificationResult) {
        console.error('Owner verification failed:', verificationResult);
        return res.status(verificationResult.status).json({ error: verificationResult.error });
    }

    next();
};

// Get all orders (owner only)
router.get('/orders', protect, ownerOnly, orderController.getAllOrders);

// Update order status (owner only)
router.patch('/orders/:id/status', protect, ownerOnly, orderController.updateOrderStatus);

module.exports = router;
