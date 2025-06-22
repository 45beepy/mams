const express = require('express');
const debugController = require('../controllers/debug.controller.js');
const router = express.Router();


router.get('/seed-database', debugController.seedDatabase);

module.exports = router;

