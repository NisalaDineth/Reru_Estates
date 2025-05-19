-- Create purchases table if it doesn't exist
CREATE TABLE IF NOT EXISTS purchases (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    stripe_session_id VARCHAR(255) NOT NULL,
    purchase_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,    status ENUM('completed', 'refunded', 'failed') NOT NULL DEFAULT 'completed',
    FOREIGN KEY (customer_id) REFERENCES customers(CustomerID)
);

-- Create purchase_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS purchase_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    purchase_id INT NOT NULL,
    harvest_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    crop_name VARCHAR(255) NOT NULL,
    FOREIGN KEY (purchase_id) REFERENCES purchases(id),
    FOREIGN KEY (harvest_id) REFERENCES harvestinventory(HarvestID)
);
