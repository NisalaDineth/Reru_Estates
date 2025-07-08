-- Reru Estates Inventory Management System Database Setup
-- Complete database creation script

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS inventory_db;
USE inventory_db;

-- Create user table
CREATE TABLE IF NOT EXISTS owner (
    id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL UNIQUE,
    PhoneNumber VARCHAR(15) NOT NULL,
    Password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'owner'
);

-- Create customer table
CREATE TABLE IF NOT EXISTS customer (
    id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL UNIQUE,
    PhoneNumber VARCHAR(15) NOT NULL,
    Password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'customer',
    isActive BOOLEAN DEFAULT TRUE
);

-- Create staff table
CREATE TABLE IF NOT EXISTS staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL UNIQUE,
    PhoneNumber VARCHAR(15) NOT NULL,
    Password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'staff'
);

-- Create harvest inventory table
CREATE TABLE IF NOT EXISTS harvestinventory (
    HarvestID INT AUTO_INCREMENT PRIMARY KEY,
    CropName VARCHAR(255) NOT NULL,
    Category VARCHAR(100) NOT NULL,
    QuantityAvailable DECIMAL(10, 2) NOT NULL,
    HarvestingDate DATE NOT NULL,
    UnitPrice DECIMAL(10, 2) NOT NULL,
    Quality ENUM('Low', 'Medium', 'High') DEFAULT 'High'
);

-- Create cart table
CREATE TABLE IF NOT EXISTS Cart (
    CartID INT AUTO_INCREMENT PRIMARY KEY,
    CustomerID INT NOT NULL,
    HarvestID INT NOT NULL,
    FOREIGN KEY (CustomerID) REFERENCES customer(id) ON DELETE CASCADE,
    FOREIGN KEY (HarvestID) REFERENCES harvestinventory(HarvestID) ON DELETE CASCADE,
    UNIQUE(CustomerID, HarvestID)
);

-- Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    stripe_session_id VARCHAR(255) NOT NULL,
    purchase_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('completed', 'refunded', 'failed') NOT NULL DEFAULT 'completed',
    FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE CASCADE
);

-- Create purchase_items table
CREATE TABLE IF NOT EXISTS purchase_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_id INT NOT NULL,
    harvest_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    crop_name VARCHAR(255) NOT NULL,
    FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
    FOREIGN KEY (harvest_id) REFERENCES harvestinventory(HarvestID) ON DELETE CASCADE
);

-- Create pending orders table
CREATE TABLE IF NOT EXISTS pending_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    stripe_session_id VARCHAR(255) NOT NULL UNIQUE,
    product_data JSON NOT NULL,
    status ENUM('pending', 'completed', 'canceled') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE CASCADE
);

-- Create inventory changes table for tracking
CREATE TABLE IF NOT EXISTS inventory_changes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    harvest_id INT NOT NULL,
    quantity_change INT NOT NULL,
    change_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES pending_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (harvest_id) REFERENCES harvestinventory(HarvestID) ON DELETE CASCADE
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('pending', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
);

-- Create system logs table
CREATE TABLE IF NOT EXISTS system_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    user_role VARCHAR(20) NOT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert a default owner account
INSERT INTO owner (Name, Email, PhoneNumber, Password, role)
VALUES ('Admin User', 'admin@reruestates.com', '1234567890', '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGq4V8MgWrxo7OQJPFcR5a', 'owner');
-- Password for admin@gmail.com is 'admin123' (bcrypt hash below)
INSERT INTO owner (Name, Email, PhoneNumber, Password, role)
VALUES ('Admin', 'admin@gmail.com', '0712345678', '$2b$10$Fg4L4vyU1utl62boKQzE/OLFrWsQ4ku43RiNggf6vRbO1M22HSYuS', 'owner');

-- Sample data for harvestinventory
INSERT INTO harvestinventory (CropName, Category, QuantityAvailable, HarvestingDate, UnitPrice, Quality) VALUES
('Tomatoes', 'Vegetables', 500, '2025-05-10', 120.00, 'High'),
('Potatoes', 'Vegetables', 350, '2025-05-12', 80.00, 'Medium'),
('Lettuce', 'Vegetables', 200, '2025-05-15', 60.00, 'High'),
('Apples', 'Fruits', 700, '2025-05-08', 150.00, 'High'),
('Rice', 'Grains', 1000, '2025-05-01', 95.00, 'Medium');

-- Sample staff member
INSERT INTO staff (name, Email, PhoneNumber, Password, role)
VALUES ('Staff User', 'staff@reruestates.com', '9876543210', '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGq4V8MgWrxo7OQJPFcR5a', 'staff');
-- Default password is 'password123' (hashed with bcrypt)

-- Sample tasks
INSERT INTO tasks (staff_id, title, due_date, status) VALUES
(1, 'Quality check on tomato harvest', '2025-05-21', 'pending'),
(1, 'Inventory verification', '2025-05-23', 'pending'),
(1, 'Update crop status reports', '2025-05-25', 'completed'),
(1, 'Assist with new produce packaging', '2025-05-27', 'pending');
