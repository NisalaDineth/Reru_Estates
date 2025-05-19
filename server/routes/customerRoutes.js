// routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const { getAllCustomers, addCustomer, updateCustomerStatus } = require('../controllers/customerController');

// Get all customers
router.get('/customers', getAllCustomers);

// Add a new customer
router.post('/customers', addCustomer);

// Update customer status
router.patch('/customers/:id/status', updateCustomerStatus);

module.exports = router;
