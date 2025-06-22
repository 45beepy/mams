const express = require('express');
const assignmentsController = require('../controllers/assignments.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');
const router = express.Router();

// All routes on this file are for Admins or Base Commanders
router.use(authMiddleware(['Admin', 'Base Commander']));

// Get data needed for the form (assets and personnel lists)
router.get('/form-data', assignmentsController.getFormData);

// Get history of assignments and expenditures
router.get('/history', assignmentsController.getHistory);

// Create a new assignment
router.post('/assign', assignmentsController.createAssignment);

// Record an expenditure
router.post('/expend', assignmentsController.createExpenditure);

module.exports = router;