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
    console.log("Searching for staff with email:", email);
    const query = "SELECT id, name as Name, Email, PhoneNumber, Password, role FROM staff WHERE Email = ?";
    const [rows] = await pool.query(query, [email]);
    console.log("Staff search result:", rows[0]);
    return rows[0];  // Return the first match, if any
};

module.exports = {
    findCustomerByEmail,
    findOwnerByEmail,
    findStaffByEmail
};
