const db = require('../config/db'); // mysql2/promise connection

const getAllInventory = async () => {
    const [rows] = await db.query('SELECT * FROM harvestinventory');
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
    const query = 'UPDATE harvestinventory SET CropName = ?, Category = ?, QuantityAvailable = ?, HarvestingDate = ?, UnitPrice = ? WHERE HarvestID = ?';
    const [result] = await db.query(
        query,
        [item.CropName, item.Category, item.QuantityAvailable, item.HarvestingDate, item.UnitPrice, id]
    );
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

module.exports = { 
    getAllInventory, 
    getAllCustomers, 
    removeCustomer, 
    insertCustomer,
    insertInventoryItem,
    updateInventoryItem,
    removeInventoryItem,
    getInventoryItemById
};
