const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authenticate = require('../middleware/authMiddleware'); // JWT auth middleware

router.post('/add', authenticate, cartController.addToCart);
router.get('/get', authenticate, cartController.getCart);
router.delete('/remove/:cartId', authenticate, cartController.deleteFromCart);
router.post('/clear', authenticate, cartController.clearCart);

module.exports = router;
