// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');  // Import MySQL connection
const { findCustomerByEmail, findOwnerByEmail, findStaffByEmail } = require('../models/customer');  // Model functions

// Handle Login
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }
    console.log("Logging in user:", req.body);

    try {
        // Check if user is a customer
        let user = await findCustomerByEmail(email);
        let role = "customer";

        // Check if customer is active
        if (user && role === "customer" && user.isActive === 0) {
            return res.status(403).json({ message: "Your account has been deactivated. Please contact support." });
        }

        // If not a customer, check if user is an owner
        if (!user) {
            user = await findOwnerByEmail(email);
            role = "owner";
        }
        
        // If not a customer or owner, check if user is a staff member
        if (!user) {
            user = await findStaffByEmail(email);
            role = "staff";
        }

        if (!user || !user.Password) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        console.log("Fetched user:", user);

        const isMatch = await bcrypt.compare(password, user.Password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        const token = jwt.sign({ id: user.id, email: user.Email, role }, "your_jwt_secret", { expiresIn: "1h" });
        console.log("Generated token:", token);

        res.json({
            message: "Login successful",
            token,
            role,
            username: user.Name,
            phone: user.PhoneNumber,
            email: user.Email,
            isActive: user.isActive
        });
    } catch (error) {
        console.error("Error logging in:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const registerCustomer = async (req, res) => {
    const { username, phone, email, password, role } = req.body;
    console.log("Registering customer:", req.body);
    if (!username || !phone || !email || !password) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    try {
        const passwordHash = await bcrypt.hash(password, 10);

        await db.query(
            `INSERT INTO customer (Name, PhoneNumber, Email, Password, role, isActive) 
             VALUES (?, ?, ?, ?, 'customer', 1)`,
            [username, phone, email, passwordHash]
        );

        res.status(201).json({ message: "Customer registered successfully" });
    } catch (error) {
        console.error("Error registering customer:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Add a function to register staff members
const registerStaff = async (req, res) => {
    const { Name, Email, PhoneNumber, Password } = req.body;
    console.log("Registering staff:", req.body);
    
    if (!Name || !PhoneNumber || !Email || !Password) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    try {
        const passwordHash = await bcrypt.hash(Password, 10);

        await db.query(
            `INSERT INTO staff (Name, PhoneNumber, Email, Password, role) 
             VALUES (?, ?, ?, ?, 'staff')`,
            [Name, PhoneNumber, Email, passwordHash]
        );

        res.status(201).json({ message: "Staff member registered successfully" });
    } catch (error) {
        console.error("Error registering staff:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


module.exports = {
    loginUser,
    registerCustomer,
    registerStaff
};
