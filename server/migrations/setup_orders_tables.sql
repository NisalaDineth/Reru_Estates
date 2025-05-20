-- Create or update the purchases table
CREATE TABLE IF NOT EXISTS purchases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending',
    stripe_session_id VARCHAR(255),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Create or update the purchase_items table
CREATE TABLE IF NOT EXISTS purchase_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_id INT NOT NULL,
    harvest_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    crop_name VARCHAR(255),
    FOREIGN KEY (purchase_id) REFERENCES purchases(id),
    FOREIGN KEY (harvest_id) REFERENCES harvestinventory(HarvestID)
);

-- Add status column to purchases if it doesn't exist
ALTER TABLE purchases
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_id ON purchases(customer_id);
CREATE INDEX IF NOT EXISTS idx_purchase_date ON purchases(purchase_date);
CREATE INDEX IF NOT EXISTS idx_status ON purchases(status);
CREATE INDEX IF NOT EXISTS idx_purchase_id ON purchase_items(purchase_id);
