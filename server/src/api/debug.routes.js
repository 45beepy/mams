const express = require('express');
const debugController = require('../controllers/debug.controller.js');
const router = express.Router();

// This route is for development purposes only.
// It provides an easy way to seed the database.
// This SHOULD be removed before a final production deployment.
router.get('/seed-database', debugController.seedDatabase);

module.exports = router;

