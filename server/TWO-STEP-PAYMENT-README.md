# Inventory Management with Two-Step Payment Confirmation

This implementation uses a two-step payment process that's more reliable than relying solely on webhooks:

1. When a customer clicks "Confirm Order," the order is saved as "pending" in the database
2. After successful payment, the order status is updated to "completed" and inventory is reduced when the user reaches the success page
3. If the payment is canceled, the order remains as "pending" or can be marked as "canceled"

## Setup Instructions

1. **Run the database migration**:
   ```
   node run-pending-orders-migration.js
   ```

2. **Test the implementation**:
   ```
   node test-pending-order.js
   ```

3. **Start the server**:
   ```
   npm start
   ```

## Flow Overview

1. **Customer initiates checkout**:
   - Products are added to cart
   - Customer clicks "Checkout"
   - Order details are saved as a pending order
   - Customer is redirected to Stripe payment page

2. **Payment processing**:
   - If payment succeeds, customer is redirected to success page
   - If payment fails, customer is redirected to cart page

3. **Order completion**:
   - Success page verifies payment with server
   - Server completes the pending order by:
     - Moving order data to purchases table
     - Reducing inventory quantities
     - Marking pending order as "completed"

4. **Advantages over webhook-only approach**:
   - More reliable - doesn't depend on webhook delivery
   - Works in local development without Stripe CLI forwarding
   - Customer gets immediate feedback on order status
   - Idempotent operations prevent duplicate processing

## Troubleshooting

- If inventory is not being reduced, check that:
  1. The pending order is being created successfully
  2. The success page is making the verify-payment API call
  3. The completePendingOrder function is executing without errors

- For additional debugging, you can run:
  ```
  node list-inventory.js
  ```
  to verify inventory levels before and after purchase.
