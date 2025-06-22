const express = require('express');
const transfersController = require('../controllers/transfers.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');
const router = express.Router();

router.use(authMiddleware(['Admin', 'Logistics Officer']));

router.get('/form-data', transfersController.getFormData);
router.get('/history', transfersController.getHistory);
router.post('/', transfersController.createTransfer);

module.exports = router;