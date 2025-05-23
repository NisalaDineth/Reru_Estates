const webhookRoutes = require('./routes/webhook');
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const staffRoutes = require('./routes/staffRoutes');
const customerRoutes = require('./routes/customerRoutes'); 
const taskRoutes = require('./routes/taskRoutes'); 
const staffInventoryRoutes = require('./routes/staffInventoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const expenseRoutes = require('./routes/expenseRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


// Special handling for Stripe webhook route
// This needs to be before the express.json() middleware to get the raw body for Stripe signature verification
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

// Regular JSON parsing for all other routes
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/owner', inventoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payment/webhook', webhookRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/owner/staff', staffRoutes);
app.use('/api/customer', inventoryRoutes);
app.use('/api/owner', customerRoutes); 
app.use('/api/staff', taskRoutes);
app.use('/api/staff', staffInventoryRoutes);
app.use('/api/owner', orderRoutes);
app.use('/api', expenseRoutes); // Added expense routes

// Start the server
const PORT = process.env.PORT || 5001;
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error handler:', {
        message: err.message,
        stack: err.stack,
        code: err.code,
        sqlMessage: err.sqlMessage
    });
    res.status(500).json({ 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? {
            message: err.message,
            code: err.code,
            sqlMessage: err.sqlMessage
        } : undefined
    });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
