const PriceHistory = require('../models/PriceHistory');

// @desc    Get price history logs (with pagination)
// @route   GET /api/prices
// @access  Private/Admin
exports.getPriceHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const query = {};

    if (req.query.product) {
      query.product = req.query.product;
    }

    const total = await PriceHistory.countDocuments(query);
    const history = await PriceHistory.find(query)
      .populate('product', 'name barcode price category')
      .populate('changedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: history,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get price history for a specific product
// @route   GET /api/prices/product/:productId
// @access  Private/Admin
exports.getProductPriceHistory = async (req, res, next) => {
  try {
    const history = await PriceHistory.find({ product: req.params.productId })
      .populate('changedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    next(error);
  }
};
