const Product = require('../models/Product');
const PriceHistory = require('../models/PriceHistory');

// @desc    Get all products (with pagination, search, category, status)
// @route   GET /api/products
// @access  Private
exports.getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const query = {};

    // Search by name or barcode
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { barcode: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Category filter
    if (req.query.category && req.query.category !== 'All') {
      query.category = req.query.category;
    }

    // Status filter
    if (req.query.status && req.query.status !== 'All') {
      query.status = req.query.status;
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('location', 'branch section shelf aisle')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: products,
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

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('location');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product by barcode
// @route   GET /api/products/barcode/:barcode
// @access  Private
exports.getProductByBarcode = async (req, res, next) => {
  try {
    const product = await Product.findOne({ barcode: req.params.barcode }).populate('location');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product with this barcode not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Get low stock products
// @route   GET /api/products/low-stock
// @access  Private
exports.getLowStockProducts = async (req, res, next) => {
  try {
    const products = await Product.find({
      $expr: { $lte: ['$quantity', '$minStock'] }
    }).populate('location', 'branch section shelf aisle').sort({ quantity: 1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
  try {
    const { name, barcode, category, description, quantity, minStock, price, costPrice, location, image, status } = req.body;

    const existingBarcode = await Product.findOne({ barcode });
    if (existingBarcode) {
      return res.status(400).json({ success: false, message: 'Barcode is already in use by another product' });
    }

    const product = await Product.create({
      name,
      barcode,
      category,
      description,
      quantity: Number(quantity) || 0,
      minStock: Number(minStock) || 10,
      price: Number(price),
      costPrice: Number(costPrice),
      location: location || null,
      image,
      status: status || 'active'
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const { name, barcode, category, description, quantity, minStock, price, costPrice, location, image, status, priceChangeReason } = req.body;

    if (barcode && barcode !== product.barcode) {
      const existingBarcode = await Product.findOne({ barcode, _id: { $ne: req.params.id } });
      if (existingBarcode) {
        return res.status(400).json({ success: false, message: 'Barcode is already in use' });
      }
      product.barcode = barcode;
    }

    // Check if price changed -> Record in PriceHistory
    if (price !== undefined && Number(price) !== product.price) {
      await PriceHistory.create({
        product: product._id,
        oldPrice: product.price,
        newPrice: Number(price),
        changedBy: req.user._id,
        reason: priceChangeReason || 'Price updated via product management'
      });
      product.price = Number(price);
    }

    if (name) product.name = name;
    if (category) product.category = category;
    if (description !== undefined) product.description = description;
    if (quantity !== undefined) product.quantity = Number(quantity);
    if (minStock !== undefined) product.minStock = Number(minStock);
    if (costPrice !== undefined) product.costPrice = Number(costPrice);
    if (location !== undefined) product.location = location || null;
    if (image !== undefined) product.image = image;
    if (status) product.status = status;

    await product.save();

    const updatedProduct = await Product.findById(product._id).populate('location');
    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};
