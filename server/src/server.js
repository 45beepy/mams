const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Route imports
const authRoutes = require('./api/auth.routes.js');
const dashboardRoutes = require('./api/dashboard.routes.js');
const debugRoutes = require('./api/debug.routes.js'); // Import the new debug routes

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Configure this more securely for production
app.use(express.json()); // To parse JSON bodies

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/debug', debugRoutes); // Add the debug routes

// Simple root route
app.get('/', (req, res) => {
  res.send('Military Asset Management System API is running.');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
