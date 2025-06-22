const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Route imports
const authRoutes = require('./api/auth.routes.js');
const dashboardRoutes = require('./api/dashboard.routes.js');
const assignmentsRoutes = require('./api/assignments.routes.js');
const purchasesRoutes = require('./api/purchases.routes.js');
const transfersRoutes = require('./api/transfers.routes.js');
const debugRoutes = require('./api/debug.routes.js'); // Added this line

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/purchases', purchasesRoutes);
app.use('/api/transfers', transfersRoutes);
app.use('/api/debug', debugRoutes); // Added this line

// Simple root route
app.get('/', (req, res) => {
  res.send('Military Asset Management System API is running.');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
