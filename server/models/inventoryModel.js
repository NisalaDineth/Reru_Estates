const db = require('../config/db'); // mysql2/promise connection

const getAllInventory = async () => {
    const [rows] = await db.query('SELECT * FROM harvestinventory');
    return rows;
};

const getRecentInventory = async (limit = 5) => {
    const [rows] = await db.query('SELECT * FROM harvestinventory ORDER BY HarvestID DESC LIMIT ?', [limit]);
    return rows;
};

const getAllCustomers = async () => {
    const [rows] = await db.query('SELECT * FROM customer');
    return rows;
};

const removeCustomer = async (customerID) => {
    const query = 'DELETE FROM customer WHERE id = ?';
    const [result] = await db.query(query, [customerID]);
    return result;
};

const insertCustomer = async (customer) => {
    const query = 'INSERT INTO customer (Name, Email, PhoneNumber, Password, role) VALUES (?, ?, ?, ?, "customer")';
    const [result] = await db.query(query, [customer.Name, customer.Email, customer.PhoneNumber, customer.Password]);
    return result;
};

// New inventory CRUD operations
const insertInventoryItem = async (item) => {
    const query = 'INSERT INTO harvestinventory (CropName, Category, QuantityAvailable, HarvestingDate, UnitPrice) VALUES (?, ?, ?, ?, ?)';
    const [result] = await db.query(
        query, 
        [item.CropName, item.Category, item.QuantityAvailable, item.HarvestingDate, item.UnitPrice]
    );
    return result;
};

const updateInventoryItem = async (id, item) => {
    // Build the SET clause dynamically based on the fields provided
    const fieldsToUpdate = [];
    const values = [];

    if (item.CropName) {
        fieldsToUpdate.push('CropName = ?');
        values.push(item.CropName);
    }

    if (item.Category) {
        fieldsToUpdate.push('Category = ?');
        values.push(item.Category);
    }

    if (item.QuantityAvailable !== undefined) {
        fieldsToUpdate.push('QuantityAvailable = ?');
        values.push(item.QuantityAvailable);
    }

    if (item.HarvestingDate) {
        fieldsToUpdate.push('HarvestingDate = ?');
        values.push(item.HarvestingDate);
    }

    if (item.UnitPrice !== undefined) {
        fieldsToUpdate.push('UnitPrice = ?');
        values.push(item.UnitPrice);
    }

    if (item.Quality) {
        fieldsToUpdate.push('Quality = ?');
        values.push(item.Quality);
    }

    // Add the ID at the end for the WHERE clause
    values.push(id);

    // If no fields to update, return
    if (fieldsToUpdate.length === 0) {
        return null;
    }

    const query = `UPDATE harvestinventory SET ${fieldsToUpdate.join(', ')} WHERE HarvestID = ?`;
    const [result] = await db.query(query, values);
    return result;
};

const removeInventoryItem = async (id) => {
    const query = 'DELETE FROM harvestinventory WHERE HarvestID = ?';
    const [result] = await db.query(query, [id]);
    return result;
};

const getInventoryItemById = async (id) => {
    const query = 'SELECT * FROM harvestinventory WHERE HarvestID = ?';
    const [rows] = await db.query(query, [id]);
    return rows[0];
};

// Reduce inventory quantity after purchase
const reduceInventoryQuantity = async (harvestId, quantity) => {
    // First check if the inventory has enough quantity
    const [inventory] = await db.query(
        'SELECT HarvestID, CropName, QuantityAvailable FROM harvestinventory WHERE HarvestID = ?',
        [harvestId]
    );
    
    if (!inventory.length) {
        throw new Error(`Product ID ${harvestId} not found in inventory`);
    }
    
    if (inventory[0].QuantityAvailable < quantity) {
        throw new Error(`Insufficient inventory for product ${inventory[0].CropName} (ID: ${harvestId}). Requested: ${quantity}, Available: ${inventory[0].QuantityAvailable}`);
    }
    
    // Update the inventory quantity with a safety check to never go below zero
    const query = 'UPDATE harvestinventory SET QuantityAvailable = GREATEST(QuantityAvailable - ?, 0) WHERE HarvestID = ?';
    const [result] = await db.query(query, [quantity, harvestId]);
    
    if (result.affectedRows === 0) {
        throw new Error(`Failed to update inventory for product ID ${harvestId}`);
    }
    
    return result;
};

module.exports = { 
    getAllInventory, 
    getRecentInventory,
    getAllCustomers, 
    removeCustomer, 
    insertCustomer,
    insertInventoryItem,
    updateInventoryItem,
    removeInventoryItem,
    getInventoryItemById,
    reduceInventoryQuantity
};
