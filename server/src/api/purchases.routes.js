const express = require('express');
const purchasesController = require('../controllers/purchases.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');
const router = express.Router();

router.use(authMiddleware(['Admin', 'Logistics Officer']));

router.get('/form-data', purchasesController.getFormData);
router.get('/history', purchasesController.getHistory);
router.post('/', purchasesController.createPurchase);

module.exports = router;