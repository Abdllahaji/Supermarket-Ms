const express = require('express');
const router = express.Router();
const {
  salesReport,
  productReport,
  customerReport,
  revenueReport
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin', 'manager'));

router.get('/sales', salesReport);
router.get('/products', productReport);
router.get('/customers', customerReport);
router.get('/revenue', revenueReport);

module.exports = router;
