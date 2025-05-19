// staffController.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getAllStaff = async (req, res) => {
    try {
        const [staff] = await db.query('SELECT * FROM staff');
        res.json(staff);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch staff' });
    }
};

exports.createStaff = async (req, res) => {
    try {
        const { Name, Email, PhoneNumber, Password } = req.body;
        
        // Encrypt password before storing
        const hashedPassword = await bcrypt.hash(Password, 10);
        
        const [result] = await db.query(
            'INSERT INTO staff (name, Email, PhoneNumber, Password, role) VALUES (?, ?, ?, ?, ?)',
            [Name, Email, PhoneNumber, hashedPassword, 'staff']
        );
        
        const newStaff = {
            id: result.insertId,
            Name,
            Email,
            PhoneNumber,
            role: 'staff'
        };
        
        res.status(201).json({ 
            message: 'Staff member added successfully',
            staff: newStaff
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to add staff member' });
    }
};

exports.updateStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const { Name, Email, PhoneNumber, Password } = req.body;
        
        // First check if staff exists
        const [staff] = await db.query('SELECT * FROM staff WHERE id = ?', [id]);
        
        if (staff.length === 0) {
            return res.status(404).json({ message: 'Staff member not found' });
        }
        
        // Build the update query dynamically
        let updateQuery = 'UPDATE staff SET ';
        const updateValues = [];
        
        if (Name) {
            updateQuery += 'name = ?, ';
            updateValues.push(Name);
        }
        
        if (Email) {
            updateQuery += 'Email = ?, ';
            updateValues.push(Email);
        }
        
        if (PhoneNumber) {
            updateQuery += 'PhoneNumber = ?, ';
            updateValues.push(PhoneNumber);
        }
        
        if (Password) {
            // Hash the password before storing
            const hashedPassword = await bcrypt.hash(Password, 10);
            updateQuery += 'Password = ?, ';
            updateValues.push(hashedPassword);
        }
        
        // Remove the trailing comma and space
        updateQuery = updateQuery.slice(0, -2);
        
        // Add the WHERE clause
        updateQuery += ' WHERE id = ?';
        updateValues.push(id);
        
        await db.query(updateQuery, updateValues);
        
        // Get the updated staff record
        const [updatedStaff] = await db.query('SELECT id, name as Name, Email, PhoneNumber FROM staff WHERE id = ?', [id]);
        
        res.json({ 
            message: 'Staff member updated successfully',
            staff: updatedStaff[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update staff member' });
    }
};

exports.deleteStaff = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await db.query('DELETE FROM staff WHERE id = ?', [id]);
        
        if (result.affectedRows > 0) {
            res.json({ message: 'Staff member deleted successfully' });
        } else {
            res.status(404).json({ message: 'Staff member not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to delete staff member' });
    }
};
