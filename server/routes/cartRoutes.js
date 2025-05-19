const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware'); // JWT auth middleware

router.post('/add', protect, cartController.addToCart);
router.get('/get', protect, cartController.getCart);
router.delete('/remove/:cartId', protect, cartController.deleteFromCart);
router.post('/clear', protect, cartController.clearCart);

module.exports = router;
