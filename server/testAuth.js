const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Mount auth routes at both paths to be sure
app.use('/api/auth', authRoutes);
app.use('/routes/auth', authRoutes);

// Add a simple test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working' });
});

// List all registered routes
const listRoutes = () => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // Routes registered directly on the app
      routes.push({
        path: middleware.route.path,
        method: Object.keys(middleware.route.methods)[0].toUpperCase(),
      });
    } else if (middleware.name === 'router') {
      // Router middleware
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const path = handler.route.path;
          const method = Object.keys(handler.route.methods)[0].toUpperCase();
          routes.push({
            path: middleware.regexp.toString().includes('/api/auth') 
              ? `/api/auth${path}` 
              : `/routes/auth${path}`,
            method,
          });
        }
      });
    }
  });
  return routes;
};

// Start server
const PORT = 5002;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log('Registered routes:');
  console.log(listRoutes());
});
