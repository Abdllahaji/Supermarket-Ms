const express = require('express');
const router = express.Router();
const {
  getSales,
  getSale,
  getSaleByInvoice,
  getDailySales,
  createSale
} = require('../controllers/saleController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/daily', getDailySales);
router.get('/invoice/:invoiceNumber', getSaleByInvoice);

router.route('/')
  .get(getSales)
  .post(createSale);

router.route('/:id')
  .get(getSale);

module.exports = router;
