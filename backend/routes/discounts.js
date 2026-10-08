const express = require('express');
const router = express.Router();
const {
  getDiscounts,
  getActiveDiscounts,
  getDiscount,
  createDiscount,
  updateDiscount,
  deleteDiscount
} = require('../controllers/discountController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/active', getActiveDiscounts);

router.route('/')
  .get(getDiscounts)
  .post(authorize('admin', 'manager'), createDiscount);

router.route('/:id')
  .get(getDiscount)
  .put(authorize('admin', 'manager'), updateDiscount)
  .delete(authorize('admin', 'manager'), deleteDiscount);

module.exports = router;
