const express = require('express');
const router = express.Router();
const {
  getPriceHistory,
  getProductPriceHistory
} = require('../controllers/priceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin', 'manager'));

router.get('/', getPriceHistory);
router.get('/product/:productId', getProductPriceHistory);

module.exports = router;
