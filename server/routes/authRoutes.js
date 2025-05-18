// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { loginUser, registerCustomer} = require("../controllers/authController");

// Public routes (no authentication required)
router.post('/login', loginUser);
router.post('/register/customer', registerCustomer);

module.exports = router;
