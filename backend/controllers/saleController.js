const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

// Helper to generate Invoice Number (INV-YYYYMMDD-XXXX)
const generateInvoiceNumber = async () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  const startOfDay = new Date(now.setHours(0, 0, 0, 0));
  const endOfDay = new Date(now.setHours(23, 59, 59, 999));

  const countToday = await Sale.countDocuments({
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  });

  const sequence = String(countToday + 1).padStart(4, '0');
  return `INV-${dateStr}-${sequence}`;
};

// @desc    Get all sales (with pagination, filters)
// @route   GET /api/sales
// @access  Private
exports.getSales = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const query = {};

    // Invoice Search
    if (req.query.search) {
      query.invoiceNumber = { $regex: req.query.search, $options: 'i' };
    }

    // Payment Method filter
    if (req.query.paymentMethod && req.query.paymentMethod !== 'All') {
      query.paymentMethod = req.query.paymentMethod;
    }

    // Cashier filter
    if (req.query.cashier) {
      query.cashier = req.query.cashier;
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      query.createdAt = {};
      if (req.query.startDate) {
        query.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        const endDate = new Date(req.query.endDate);
        endDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDate;
      }
    }

    const total = await Sale.countDocuments(query);
    const sales = await Sale.find(query)
      .populate('cashier', 'name email')
      .populate('customer', 'name phone email loyaltyPoints')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: sales,
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

// @desc    Get single sale
// @route   GET /api/sales/:id
// @access  Private
exports.getSale = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('cashier', 'name email phone')
      .populate('customer', 'name email phone address loyaltyPoints')
      .populate('items.product', 'name barcode price category');

    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale record not found' });
    }

    res.status(200).json({ success: true, data: sale });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sale by invoice number
// @route   GET /api/sales/invoice/:invoiceNumber
// @access  Private
exports.getSaleByInvoice = async (req, res, next) => {
  try {
    const sale = await Sale.findOne({ invoiceNumber: req.params.invoiceNumber })
      .populate('cashier', 'name email')
      .populate('customer', 'name email phone loyaltyPoints')
      .populate('items.product', 'name barcode price');

    if (!sale) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.status(200).json({ success: true, data: sale });
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's sales summary
// @route   GET /api/sales/daily
// @access  Private
exports.getDailySales = async (req, res, next) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const salesToday = await Sale.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const count = salesToday.length;
    const totalRevenue = salesToday.reduce((sum, s) => sum + s.totalAmount, 0);
    const averageTransaction = count > 0 ? (totalRevenue / count) : 0;

    res.status(200).json({
      success: true,
      data: {
        count,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        averageTransaction: Number(averageTransaction.toFixed(2))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new sale
// @route   POST /api/sales
// @access  Private
exports.createSale = async (req, res, next) => {
  try {
    const {
      customer,
      items,
      subtotal,
      discountAmount = 0,
      taxAmount = 0,
      totalAmount,
      paymentMethod = 'cash',
      amountPaid,
      change = 0
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items cannot be empty' });
    }

    if (amountPaid < totalAmount && paymentMethod === 'cash') {
      return res.status(400).json({ success: false, message: 'Amount paid is less than total amount' });
    }

    const cashierId = req.user._id;
    const invoiceNumber = await generateInvoiceNumber();

    // Verify stock and update product quantities
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (product) {
        if (product.quantity < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for product "${product.name}". Available: ${product.quantity}`
          });
        }
        product.quantity -= Number(item.quantity);
        await product.save();
      }
    }

    // Create Sale
    const sale = await Sale.create({
      invoiceNumber,
      cashier: cashierId,
      customer: customer || null,
      items,
      subtotal: Number(subtotal),
      discountAmount: Number(discountAmount),
      taxAmount: Number(taxAmount),
      totalAmount: Number(totalAmount),
      paymentMethod,
      amountPaid: Number(amountPaid),
      change: Number(change)
    });

    // Update customer stats and loyalty points if customer is attached
    if (customer) {
      const customerDoc = await Customer.findById(customer);
      if (customerDoc) {
        customerDoc.totalPurchases += Number(totalAmount);
        // 1 loyalty point per $10 spent
        const earnedPoints = Math.floor(totalAmount / 10);
        customerDoc.loyaltyPoints += earnedPoints;
        await customerDoc.save();
      }
    }

    const populatedSale = await Sale.findById(sale._id)
      .populate('cashier', 'name email')
      .populate('customer', 'name email phone loyaltyPoints');

    res.status(201).json({
      success: true,
      data: populatedSale,
      message: 'Sale completed successfully'
    });
  } catch (error) {
    next(error);
  }
};
