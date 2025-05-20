const db = require('../config/db');

// Helper function to verify database tables
const verifyDatabaseTables = async () => {
    // Get list of tables
    const [tables] = await db.query(`
        SELECT TABLE_NAME, TABLE_TYPE
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = DATABASE()
    `);
    console.log('Available tables:', tables.map(t => t.TABLE_NAME));
    return tables;
};

// Get all orders
exports.getAllOrders = async (req, res) => {
    try {
        console.log('Getting orders for user:', req.user);
        
        // Verify user role
        if (!req.user || req.user.role !== 'owner') {
            console.error('Unauthorized access attempt:', req.user);
            return res.status(403).json({ error: 'Access denied. Owner permission required.' });
        }        // First verify database tables exist
        const tables = await verifyDatabaseTables();
        
        // Show current user and role
        console.log('Current user and role:', {
            id: req.user.id,
            role: req.user.role,
            name: req.user.name
        });
        
        // Debug: Check for any customers in the table
        const [customerCount] = await db.query('SELECT COUNT(*) as count FROM customer');
        console.log('Total customers in database:', customerCount[0].count);
        
        // Debug: Check for any purchases in the table
        const [purchaseCount] = await db.query('SELECT COUNT(*) as count FROM purchases');
        console.log('Total purchases in database:', purchaseCount[0].count);
        
        // Verify the customer table structure
        console.log('Checking customer table structure...');
        const [customerColumns] = await db.query(`
            SELECT COLUMN_NAME, DATA_TYPE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'customer'
        `);
        console.log('Customer table columns:', customerColumns);

        // Verify the purchases table structure
        console.log('Checking purchases table structure...');
        const [purchaseColumns] = await db.query(`
            SELECT COLUMN_NAME, DATA_TYPE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'purchases'
        `);
        console.log('Purchases table columns:', purchaseColumns);        // Try to get orders with customer details in a single query
        console.log('Fetching orders with customer details...');
        const [orders] = await db.query(`
            SELECT 
                p.id,
                p.customer_id,
                c.Name as customer_name,
                CAST(p.total_amount AS DECIMAL(10,2)) as total_amount,
                p.purchase_date,
                p.status,
                p.stripe_session_id
            FROM purchases p
            LEFT JOIN customer c ON p.customer_id = c.id
            ORDER BY p.purchase_date DESC
        `);
        console.log('Orders with customer details found:', orders ? orders.length : 0);

        // If we have orders, get their items
        if (orders && orders.length > 0) {
            for (let order of orders) {
                try {
                    // Get order items with crop names
                    const [items] = await db.query(`
                        SELECT 
                            pi.quantity,
                            pi.unit_price,
                            pi.subtotal,
                            h.CropName as cropName
                        FROM purchase_items pi
                        LEFT JOIN harvestinventory h ON pi.harvest_id = h.HarvestID
                        WHERE pi.purchase_id = ?
                    `, [order.id]);
                    
                    order.items = items || [];
                    console.log(`Found ${items.length} items for order ${order.id}`);
                } catch (itemError) {
                    console.error(`Error fetching items for order ${order.id}:`, itemError);
                    order.items = [];
                }
            }
        }

        res.json(orders || []);
    } catch (error) {
        console.error('Error in getAllOrders:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
            sqlMessage: error.sqlMessage,
            state: error.sqlState
        });

        res.status(500).json({
            error: 'Failed to get orders',
            details: process.env.NODE_ENV === 'development' ? {
                message: error.message,
                code: error.code,
                sqlMessage: error.sqlMessage,
                state: error.sqlState
            } : undefined
        });
    }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        // Verify valid status
        if (!['pending', 'completed'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be either "pending" or "completed"' });
        }

        // Log the update attempt
        console.log(`Attempting to update order ${id} to status: ${status}`);

        // Update the order status
        const [result] = await db.query(
            'UPDATE purchases SET status = ? WHERE id = ?',
            [status, id]
        );

        if (result.affectedRows === 0) {
            console.log(`No order found with id: ${id}`);
            return res.status(404).json({ error: 'Order not found' });
        }

        // Get the updated order details
        const [updatedOrder] = await db.query(
            'SELECT id, status FROM purchases WHERE id = ?',
            [id]
        );

        console.log(`Successfully updated order ${id} to status: ${status}`);
        
        res.json({ 
            message: 'Order status updated successfully',
            order: updatedOrder[0]
        });
    } catch (error) {
        console.error('Error updating order status:', {
            message: error.message,
            code: error.code,
            sqlMessage: error.sqlMessage
        });
        res.status(500).json({ error: 'Failed to update order status' });
    }
};
