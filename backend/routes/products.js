const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  getProductByBarcode,
  getLowStockProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Specific routes first
router.get('/barcode/:barcode', getProductByBarcode);
router.get('/low-stock', getLowStockProducts);

router.route('/')
  .get(getProducts)
  .post(authorize('admin', 'manager'), createProduct);

router.route('/:id')
  .get(getProduct)
  .put(authorize('admin', 'manager'), updateProduct)
  .delete(authorize('admin'), deleteProduct);

module.exports = router;
