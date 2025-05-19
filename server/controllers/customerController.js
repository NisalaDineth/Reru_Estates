// controllers/customerController.js
const bcrypt = require('bcryptjs');
const db = require('../config/db');

// Get all customers
const getAllCustomers = async (req, res) => {
    try {
        const [customers] = await db.query('SELECT id, Name, Email, PhoneNumber, isActive FROM customer');
        res.json(customers);
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ message: 'Failed to fetch customers' });
    }
};

// Add a new customer
const addCustomer = async (req, res) => {
    const { Name, Email, PhoneNumber, Password } = req.body;
    
    if (!Name || !Email || !Password) {
        return res.status(400).json({ message: 'Name, Email, and Password are required' });
    }

    try {
        // Check if customer with this email already exists
        const [existingCustomers] = await db.query('SELECT * FROM customer WHERE Email = ?', [Email]);
        
        if (existingCustomers.length > 0) {
            return res.status(400).json({ message: 'A customer with this email already exists' });
        }

        // Hash the password
        const passwordHash = await bcrypt.hash(Password, 10);
        
        // Insert the new customer - explicitly set isActive to TRUE
        const [result] = await db.query(
            'INSERT INTO customer (Name, Email, PhoneNumber, Password, role, isActive) VALUES (?, ?, ?, ?, "customer", TRUE)',
            [Name, Email, PhoneNumber, passwordHash]
        );
        
        res.status(201).json({ 
            message: 'Customer added successfully',
            customerId: result.insertId 
        });
    } catch (error) {
        console.error('Error adding customer:', error);
        res.status(500).json({ message: 'Failed to add customer' });
    }
};

// Update customer status
const updateCustomerStatus = async (req, res) => {
    const customerId = req.params.id;
    const { isActive } = req.body;
    
    console.log('Updating customer status:', { customerId, isActive });
    
    try {
        // Convert to number (MySQL boolean)
        const activeStatus = isActive ? 1 : 0;
        
        const [result] = await db.query(
            'UPDATE customer SET isActive = ? WHERE id = ?', 
            [activeStatus, customerId]
        );
        
        console.log('Update result:', result);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        
        res.json({ 
            message: `Customer ${isActive ? 'activated' : 'deactivated'} successfully` 
        });
    } catch (error) {
        console.error('Error updating customer status:', error);
        res.status(500).json({ message: 'Failed to update customer status' });
    }
};

module.exports = {
    getAllCustomers,
    addCustomer,
    updateCustomerStatus
};
