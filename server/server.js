const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const staffRoutes = require('./routes/staffRoutes');

const app = express();

// Middleware
app.use(cors());

// Special handling for Stripe webhook route
// This needs to be before the express.json() middleware to get the raw body for Stripe signature verification
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

// Regular JSON parsing for all other routes
app.use(express.json());

// Routes
app.use('/routes/auth', authRoutes);
app.use('/api/owner', inventoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/owner/staff', staffRoutes);
app.use('/api/customer', inventoryRoutes);

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
