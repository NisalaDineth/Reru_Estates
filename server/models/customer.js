// models/customer.js
const pool = require('../config/db'); // Import MySQL connection

const findCustomerByEmail = async (email) => {
    const query = "SELECT id, Name, Email, PhoneNumber, Password, role, isActive FROM customer WHERE Email = ?";
    const [rows] = await pool.query(query, [email]);
    return rows[0];  // Return the first match, if any
};

const findOwnerByEmail = async (email) => {
    const query = "SELECT * FROM owner WHERE Email = ?";
    const [rows] = await pool.query(query, [email]);
    return rows[0];  // Return the first match, if any
};

const findStaffByEmail = async (email) => {
    const query = "SELECT * FROM staff WHERE Email = ?";
    const [rows] = await pool.query(query, [email]);
    return rows[0];  // Return the first match, if any
};

module.exports = {
    findCustomerByEmail,
    findOwnerByEmail,
    findStaffByEmail
};
