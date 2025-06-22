const express = require('express');
const dashboardController = require('../controllers/dashboard.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');
const router = express.Router();


router.use(authMiddleware(['Admin', 'Base Commander', 'Logistics Officer']));

router.get('/metrics', dashboardController.getMetrics);
router.get('/net-movement-details', dashboardController.getNetMovementDetails);
router.get('/filters', dashboardController.getFilterOptions);

module.exports = router;
