// routes/staffInventoryRoutes.js
const express = require('express');
const router = express.Router();
const { 
  updateInventoryItem, 
  getAllInventoryItems, 
  getInventoryItemById 
} = require('../controllers/staffInventoryController');
const { protect, staffOnly } = require('../middleware/authMiddleware');

// All routes need authentication and staff role
router.use(protect);
router.use(staffOnly);

// Get all inventory items
router.get('/inventory', getAllInventoryItems);

// Get inventory item by ID
router.get('/inventory/:harvestID', getInventoryItemById);

// Update inventory item
router.put('/inventory/:harvestID', updateInventoryItem);

module.exports = router;
