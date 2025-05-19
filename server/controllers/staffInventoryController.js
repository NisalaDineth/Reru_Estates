// controllers/staffInventoryController.js
const InventoryModel = require('../models/inventoryModel');

// Update inventory item by staff
const updateInventoryItem = async (req, res) => {
  try {
    const { harvestID } = req.params;
    const { quantityAvailable, unitPrice, quality } = req.body;
    
    // Validate inputs
    if (!quantityAvailable || !unitPrice || !quality) {
      return res.status(400).json({ 
        message: 'Quantity, unit price, and quality are required' 
      });
    }
    
    // In a real application, you would check if the staff has permission to update this item
    
    // Update the inventory item
    const result = await InventoryModel.updateInventoryItem(
      harvestID,
      { 
        QuantityAvailable: quantityAvailable,
        UnitPrice: unitPrice,
        Quality: quality
      }
    );
    
    if (result) {
      return res.status(200).json({ 
        message: 'Inventory item updated successfully' 
      });
    } else {
      return res.status(404).json({ 
        message: 'Inventory item not found' 
      });
    }
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return res.status(500).json({ 
      message: 'Failed to update inventory item' 
    });
  }
};

// Get all inventory items
const getAllInventoryItems = async (req, res) => {
  try {
    const items = await InventoryModel.getAllInventory();
    res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    res.status(500).json({ 
      message: 'Failed to fetch inventory items' 
    });
  }
};

// Get inventory item by ID
const getInventoryItemById = async (req, res) => {
  try {
    const { harvestID } = req.params;
    const item = await InventoryModel.getInventoryItemById(harvestID);
    
    if (item) {
      res.status(200).json(item);
    } else {
      res.status(404).json({ 
        message: 'Inventory item not found' 
      });
    }
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({ 
      message: 'Failed to fetch inventory item' 
    });
  }
};

module.exports = {
  updateInventoryItem,
  getAllInventoryItems,
  getInventoryItemById
};
