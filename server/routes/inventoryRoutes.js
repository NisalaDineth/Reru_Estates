const express = require('express');
const router = express.Router();
const {getInventory, getCustomers, deleteCustomer,addCustomer, addInventoryItem, updateInventory, deleteInventory} = require('../controllers/inventoryController');

router.post('/inventory/add', addInventoryItem);
router.put('/inventory/update/:harvestId', updateInventory);
router.delete('/inventory/delete/:harvestId', deleteInventory);
router.get('/inventory', getInventory);
router.get('/customers', getCustomers);
router.delete('/customers/:id', deleteCustomer);
router.post('/customers', addCustomer);

module.exports = router;
