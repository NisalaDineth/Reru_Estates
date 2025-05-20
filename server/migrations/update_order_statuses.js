const db = require('../config/db');

async function updateOrderStatuses() {
    try {
        console.log('Starting order status update...');
        
        // Update all orders to pending status
        const [result] = await db.query(`
            UPDATE purchases 
            SET status = 'pending' 
            WHERE status IS NULL OR status NOT IN ('pending', 'completed')
        `);
        
        console.log(`Updated ${result.affectedRows} orders to pending status`);
        
        // Modify the column to ensure pending is the default
        await db.query(`
            ALTER TABLE purchases 
            MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'pending'
        `);
        
        console.log('Successfully updated orders table schema');
        
        process.exit(0);
    } catch (error) {
        console.error('Error updating order statuses:', error);
        process.exit(1);
    }
}

updateOrderStatuses();