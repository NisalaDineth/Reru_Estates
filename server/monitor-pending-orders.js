const db = require('./config/db');
const PendingOrder = require('./models/pendingOrderModel');
const stripe = require('stripe')('sk_test_51RP7LrQhVN6fGceWvctZEJkI43WFYCpeEitVuENlxfzLilks8f8fu1zLGJ3FN1CztCQsnJe3EpgD9F33TmEqxPHF00KHYFMlSK');

/**
 * Monitors pending orders and checks their status with Stripe
 * This script can be run as a cron job to clean up stuck pending orders
 */
async function monitorPendingOrders() {
  try {
    console.log('🔍 Monitoring pending orders - Started at:', new Date().toISOString());
    
    // Get all pending orders that are more than 1 hour old
    const [orders] = await db.query(`
      SELECT * FROM pending_orders 
      WHERE status = 'pending' 
      AND order_date < DATE_SUB(NOW(), INTERVAL 1 HOUR)
    `);
    
    console.log(`Found ${orders.length} pending orders older than 1 hour`);
    
    if (orders.length === 0) {
      console.log('No stuck orders to process');
      return;
    }
    
    for (const order of orders) {
      console.log(`\nProcessing order ID: ${order.id} with session ID: ${order.stripe_session_id}`);
      
      try {
        // Check Stripe payment status
        const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id);
        console.log(`Stripe session status: ${session.status}, payment status: ${session.payment_status}`);
        
        if (session.payment_status === 'paid') {
          // Payment successful, complete the order
          console.log(`✅ Session ${order.stripe_session_id} is paid but not processed - completing order now`);
          
          try {
            const result = await PendingOrder.completePendingOrder(order.stripe_session_id);
            console.log(`✅ Successfully completed order ID: ${order.id}, created purchase ID: ${result.purchaseId}`);
            
            // Log this recovery for audit purposes
            await db.query(
              'INSERT INTO system_logs (event_type, event_details) VALUES (?, ?)',
              ['order_recovery', JSON.stringify({
                order_id: order.id,
                session_id: order.stripe_session_id,
                purchase_id: result.purchaseId,
                recovery_time: new Date().toISOString()
              })]
            );
          } catch (completeError) {
            console.error(`❌ Failed to complete order ID: ${order.id}:`, completeError);
          }
        } else if (session.payment_status === 'unpaid' || session.status === 'expired') {
          // Payment failed or expired, cancel the order
          console.log(`❌ Session ${order.stripe_session_id} is ${session.status}/${session.payment_status} - canceling order`);
          
          const canceled = await PendingOrder.cancelPendingOrder(order.stripe_session_id);
          console.log(`${canceled ? '✅' : '❌'} Canceled order ID: ${order.id}`);
          
          // Log this cancellation for audit purposes
          await db.query(
            'INSERT INTO system_logs (event_type, event_details) VALUES (?, ?)',
            ['order_cancellation', JSON.stringify({
              order_id: order.id,
              session_id: order.stripe_session_id,
              reason: `Payment ${session.status}/${session.payment_status}`,
              cancellation_time: new Date().toISOString()
            })]
          );
        } else {
          console.log(`⏳ Session ${order.stripe_session_id} is in ${session.status}/${session.payment_status} state - no action taken`);
        }
      } catch (stripeError) {
        console.error(`Error retrieving Stripe session ${order.stripe_session_id}:`, stripeError);
        
        // If we can't find the session in Stripe, it might be invalid or very old
        if (stripeError.code === 'resource_missing') {
          console.log(`Session ${order.stripe_session_id} not found in Stripe - canceling order`);
          const canceled = await PendingOrder.cancelPendingOrder(order.stripe_session_id);
          console.log(`${canceled ? '✅' : '❌'} Canceled order ID: ${order.id} due to missing Stripe session`);
        }
      }
    }
    
    console.log('\n🏁 Monitoring completed at:', new Date().toISOString());
  } catch (error) {
    console.error('Error in monitoring pending orders:', error);
  }
}

// If this script is run directly, execute the monitoring
if (require.main === module) {
  monitorPendingOrders()
    .then(() => {
      console.log('Monitoring completed');
      process.exit(0);
    })
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

module.exports = { monitorPendingOrders };
