const Discount = require('../models/Discount');

// @desc    Get all discounts (with pagination, search)
// @route   GET /api/discounts
// @access  Private/Admin
exports.getDiscounts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const query = {};

    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: 'i' };
    }

    if (req.query.status && req.query.status !== 'All') {
      query.status = req.query.status;
    }

    const total = await Discount.countDocuments(query);
    const discounts = await Discount.find(query)
      .populate('products', 'name barcode price')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: discounts,
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

// @desc    Get active discounts (currently valid by date and status)
// @route   GET /api/discounts/active
// @access  Private
exports.getActiveDiscounts = async (req, res, next) => {
  try {
    const now = new Date();
    const discounts = await Discount.find({
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).populate('products', 'name barcode price category');

    res.status(200).json({
      success: true,
      data: discounts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single discount
// @route   GET /api/discounts/:id
// @access  Private/Admin
exports.getDiscount = async (req, res, next) => {
  try {
    const discount = await Discount.findById(req.params.id).populate('products', 'name barcode price');
    if (!discount) {
      return res.status(404).json({ success: false, message: 'Discount not found' });
    }
    res.status(200).json({ success: true, data: discount });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new discount
// @route   POST /api/discounts
// @access  Private/Admin
exports.createDiscount = async (req, res, next) => {
  try {
    const { name, type, value, startDate, endDate, products, categories, minPurchase, status } = req.body;

    if (!name || !type || value === undefined || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const discount = await Discount.create({
      name,
      type,
      value: Number(value),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      products: products || [],
      categories: categories || [],
      minPurchase: Number(minPurchase) || 0,
      status: status || 'active'
    });

    const populatedDiscount = await Discount.findById(discount._id).populate('products', 'name barcode price');
    res.status(201).json({ success: true, data: populatedDiscount });
  } catch (error) {
    next(error);
  }
};

// @desc    Update discount
// @route   PUT /api/discounts/:id
// @access  Private/Admin
exports.updateDiscount = async (req, res, next) => {
  try {
    let discount = await Discount.findById(req.params.id);
    if (!discount) {
      return res.status(404).json({ success: false, message: 'Discount not found' });
    }

    const { name, type, value, startDate, endDate, products, categories, minPurchase, status } = req.body;

    if (name) discount.name = name;
    if (type) discount.type = type;
    if (value !== undefined) discount.value = Number(value);
    if (startDate) discount.startDate = new Date(startDate);
    if (endDate) discount.endDate = new Date(endDate);
    if (products !== undefined) discount.products = products;
    if (categories !== undefined) discount.categories = categories;
    if (minPurchase !== undefined) discount.minPurchase = Number(minPurchase);
    if (status) discount.status = status;

    await discount.save();

    const updatedDiscount = await Discount.findById(discount._id).populate('products', 'name barcode price');
    res.status(200).json({ success: true, data: updatedDiscount });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete discount
// @route   DELETE /api/discounts/:id
// @access  Private/Admin
exports.deleteDiscount = async (req, res, next) => {
  try {
    const discount = await Discount.findById(req.params.id);
    if (!discount) {
      return res.status(404).json({ success: false, message: 'Discount not found' });
    }

    await Discount.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Discount deleted successfully' });
  } catch (error) {
    next(error);
  }
};
