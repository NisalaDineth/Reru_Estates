const db = require('../config/db');

// Create a new pending order
const createPendingOrder = async (order) => {
    const { customerId, totalAmount, products, stripeSessionId } = order;
    
    try {
        // Serialize products array to JSON string
        const productsJson = JSON.stringify(products);
        
        // Check if a pending order already exists for this session ID (idempotency)
        const [existingOrders] = await db.query(
            'SELECT id FROM pending_orders WHERE stripe_session_id = ?',
            [stripeSessionId]
        );
        
        if (existingOrders && existingOrders.length > 0) {
            console.log(`Pending order already exists for session ${stripeSessionId}, ID: ${existingOrders[0].id}`);
            return existingOrders[0].id;
        }
        
        const query = 'INSERT INTO pending_orders (customer_id, total_amount, product_data, stripe_session_id) VALUES (?, ?, ?, ?)';
        const [result] = await db.query(query, [customerId, totalAmount, productsJson, stripeSessionId]);
        
        return result.insertId;
    } catch (err) {
        console.error('Error creating pending order:', err);
        throw err;
    }
};

// Get a pending order by Stripe session ID
const getPendingOrderBySessionId = async (sessionId) => {
    try {
        const query = 'SELECT * FROM pending_orders WHERE stripe_session_id = ?';
        const [rows] = await db.query(query, [sessionId]);
        
        if (rows.length === 0) {
            return null;
        }
          
        // Parse the product_data JSON
        const order = rows[0];
        try {
            if (order.product_data && typeof order.product_data === 'string') {
                order.products = JSON.parse(order.product_data);
            } else if (order.product_data) {
                // If already an object, use it directly
                order.products = order.product_data;
            } else {
                order.products = [];
            }
        } catch (err) {
            console.error('Error parsing product_data JSON:', err);
            console.error('Raw product_data:', order.product_data);
            // Set an empty array as fallback
            order.products = [];
        }
        
        return order;
    } catch (err) {
        console.error('Error getting pending order:', err);
        throw err;
    }
};

// Update a pending order to completed status and process inventory
const completePendingOrder = async (sessionId) => {
    // Start a transaction
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        // Get the pending order
        const [orderRows] = await connection.query(
            'SELECT * FROM pending_orders WHERE stripe_session_id = ? AND status = "pending" FOR UPDATE',
            [sessionId]
        );
        
        if (orderRows.length === 0) {
            throw new Error(`No pending order found for session ID: ${sessionId}`);
        }
          const order = orderRows[0];
        let products;
          if (order.product_data && typeof order.product_data === 'string') {
            try {
                products = JSON.parse(order.product_data);
            } catch (parseError) {
                console.error('Failed to parse product_data:', parseError);
                console.error('Raw product_data:', order.product_data);
                throw new Error('Failed to parse product data: ' + parseError.message);
            }
        } else if (order.product_data) {
            // If already an object, use it directly
            products = order.product_data;
        } else {
            products = [];
        }
        
        if (!Array.isArray(products) || products.length === 0) {
            console.error('Invalid product data format:', products);
            throw new Error('Invalid product data format or empty product list');
        }
          // Verify inventory availability for all products
        for (const product of products) {
            console.log('Checking product:', JSON.stringify(product));
            
            const harvestId = product.HarvestID || product.harvest_id;
            const requiredQuantity = parseInt(product.required_quantity || 1, 10);
            
            if (!harvestId) {
                console.error('Missing harvest ID in product:', JSON.stringify(product));
                throw new Error('Missing harvest ID in product data. Product data: ' + JSON.stringify(product));
            }
            
            const [inventory] = await connection.query(
                'SELECT HarvestID, CropName, QuantityAvailable FROM harvestinventory WHERE HarvestID = ? FOR UPDATE',
                [harvestId]
            );
            
            if (!inventory.length) {
                throw new Error(`Product ${harvestId} not found in inventory`);
            }
            
            if (inventory[0].QuantityAvailable < requiredQuantity) {
                throw new Error(`Insufficient inventory for product ${harvestId}. Required: ${requiredQuantity}, Available: ${inventory[0].QuantityAvailable}`);
            }
        }
        
        // Move the pending order to purchases table
        const [purchaseResult] = await connection.query(
            'INSERT INTO purchases (customer_id, total_amount, stripe_session_id, purchase_date) VALUES (?, ?, ?, NOW())',
            [order.customer_id, order.total_amount, sessionId]
        );
        
        const purchaseId = purchaseResult.insertId;
        
        // Insert purchase items and update inventory
        for (const product of products) {
            const harvestId = product.HarvestID || product.harvest_id;
            const requiredQuantity = parseInt(product.required_quantity || 1, 10);
            const unitPrice = parseFloat(product.UnitPrice || product.unit_price || 0);
            const subTotal = parseFloat(product.sub_total || (unitPrice * requiredQuantity));
              // Insert purchase item
            await connection.query(
                'INSERT INTO purchase_items (purchase_id, harvest_id, quantity, unit_price, subtotal, crop_name) VALUES (?, ?, ?, ?, ?, ?)',
                [purchaseId, harvestId, requiredQuantity, unitPrice, subTotal, product.CropName || 'Unknown']
            );
            
            // Update inventory
            const updateResult = await connection.query(
                'UPDATE harvestinventory SET QuantityAvailable = GREATEST(QuantityAvailable - ?, 0) WHERE HarvestID = ?',
                [requiredQuantity, harvestId]
            );
            
            if (updateResult[0].affectedRows === 0) {
                throw new Error(`Failed to update inventory for product ID ${harvestId}`);
            }
            
            // Record inventory change
            await connection.query(
                'INSERT INTO inventory_changes (order_id, harvest_id, quantity_change) VALUES (?, ?, ?)',
                [order.id, harvestId, -requiredQuantity]
            );
        }
        
        // Update the pending order status to completed
        await connection.query(
            'UPDATE pending_orders SET status = "completed" WHERE id = ?',
            [order.id]
        );
        
        await connection.commit();
        return { success: true, purchaseId };
    } catch (err) {
        await connection.rollback();
        console.error('Error completing pending order:', err);
        throw err;
    } finally {
        connection.release();
    }
};

// Cancel a pending order
const cancelPendingOrder = async (sessionId) => {
    const query = 'UPDATE pending_orders SET status = "canceled" WHERE stripe_session_id = ? AND status = "pending"';
    const [result] = await db.query(query, [sessionId]);
    
    return result.affectedRows > 0;
};

module.exports = {
    createPendingOrder,
    getPendingOrderBySessionId,
    completePendingOrder,
    cancelPendingOrder
};
