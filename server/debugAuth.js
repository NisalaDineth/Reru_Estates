// Debug version of server.js
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const app = express();

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true
}));
app.use(express.json());

// Mount auth routes on both paths
app.use('/routes/auth', authRoutes);
app.use('/api/auth', authRoutes);

// Add a test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Debug server is working' });
});

// Start the server
const PORT = 5005;
app.listen(PORT, () => {
  console.log(`Debug Auth Server running on port ${PORT}`);
});
