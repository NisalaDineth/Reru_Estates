const bcrypt = require('bcryptjs');

const { 
    getAllInventory, 
    getAllCustomers, 
    removeCustomer, 
    insertCustomer,
    insertInventoryItem,
    updateInventoryItem,
    removeInventoryItem,
    getInventoryItemById
} = require('../models/inventoryModel');

// const addItem = async (req, res) => {
//     const { CropName, Category, QuantityAvailable, HarvestingDate, UnitPrice } = req.body;

//     if (!CropName || !Category || !QuantityAvailable || !HarvestingDate || !UnitPrice) {
//         return res.status(400).json({ message: "Please fill in all fields" });

//     }
//     try {
//         const result = await insertInventoryItem({ CropName, Category, QuantityAvailable, HarvestingDate, UnitPrice });
//         res.status(201).json({ message: "Item added successfully", itemId: result.insertId });
//     }
//     catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Failed to add item" });
//         }
//     }

const getInventory = async (req, res) => {
    try {
        const data = await getAllInventory();
        res.status(200).json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
};

const getCustomers = async (req, res) => {
    try {
        const data = await getAllCustomers();
        res.status(200).json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
};

const deleteCustomer = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await removeCustomer(id);
        if (result.affectedRows > 0) {
            res.status(200).json({ message: "Customer deleted successfully." });
        } else {
            res.status(404).json({ message: "Customer not found." });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
};

const addCustomer = async (req, res) => {
    try {
        const { Name, Email, PhoneNumber, Password } = req.body;

        if (!Password) {
            return res.status(400).json({ error: "Password is required" });
        }

        const hashedPassword = await bcrypt.hash(Password, 10);

        insertCustomer({ Name, Email, PhoneNumber, Password: hashedPassword }, (err, result) => {
            if (err) {
                return res.status(500).json({ error: "Insert failed" });
            }
            res.status(201).json({ message: "Customer added successfully", customerId: result.insertId });
        });
    } catch (err) {
        console.error("Add error:", err);
        res.status(500).json({ error: "Internal error" });
    }
};

// New inventory CRUD operations
const addInventoryItem = async (req, res) => {
    try {
        const { CropName, Category, QuantityAvailable, HarvestingDate, UnitPrice } = req.body;
        
        // Validate required fields
        if (!CropName || !Category || !QuantityAvailable || !HarvestingDate || !UnitPrice) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        const result = await insertInventoryItem({
            CropName, 
            Category, 
            QuantityAvailable, 
            HarvestingDate, 
            UnitPrice
        });
        
        res.status(201).json({ 
            message: 'Inventory item added successfully', 
            itemId: result.insertId 
        });
    } catch (err) {
        console.error('Error adding inventory item:', err);
        res.status(500).json({ message: 'Failed to add inventory item' });
    }
};

const updateInventory = async (req, res) => {
    try {
        const { harvestId } = req.params;
        console.log("Updating inventory item with ID:", harvestId);
        const { CropName, Category, QuantityAvailable, HarvestingDate, UnitPrice } = req.body;
        console.log("Request body:", req.body);
        
        // Validate required fields
        if (!CropName || !Category || !QuantityAvailable || !HarvestingDate || !UnitPrice) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        // Check if item exists
        const item = await getInventoryItemById(harvestId);
        if (!item) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }
        
        const result = await updateInventoryItem(harvestId, {
            CropName, 
            Category, 
            QuantityAvailable, 
            HarvestingDate, 
            UnitPrice
        });
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }
        
        res.json({ message: 'Inventory item updated successfully' });
    } catch (err) {
        console.error('Error updating inventory item:', err);
        res.status(500).json({ message: 'Failed to update inventory item' });
    }
};

const deleteInventory = async (req, res) => {
    const { harvestId } = req.params;
    try {
        const result = await removeInventoryItem(harvestId);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }
        
        res.json({ message: 'Inventory item deleted successfully' });
    } catch (err) {
        console.error('Error deleting inventory item:', err);
        res.status(500).json({ message: 'Failed to delete inventory item' });
    }
};

module.exports = { 
    getInventory, 
    getCustomers, 
    deleteCustomer, 
    addCustomer,
    addInventoryItem,
    updateInventory,
    deleteInventory
};
