const Customer = require('../models/Customer');

// @desc    Get all customers (with pagination, search)
// @route   GET /api/customers
// @access  Private
exports.getCustomers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const query = {};

    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { phone: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const total = await Customer.countDocuments(query);
    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: customers,
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

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private
exports.getCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new customer
// @route   POST /api/customers
// @access  Private
exports.createCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, address } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and phone are required' });
    }

    if (email && email.trim() !== '') {
      const existingEmail = await Customer.findOne({ email: email.toLowerCase() });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
      }
    }

    const customer = await Customer.create({
      name,
      email: email ? email.toLowerCase() : undefined,
      phone,
      address,
      loyaltyPoints: 0,
      totalPurchases: 0
    });

    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
exports.updateCustomer = async (req, res, next) => {
  try {
    let customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const { name, email, phone, address, loyaltyPoints, totalPurchases } = req.body;

    if (email && email.toLowerCase() !== customer.email) {
      const emailExists = await Customer.findOne({ email: email.toLowerCase(), _id: { $ne: req.params.id } });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email is already in use' });
      }
      customer.email = email.toLowerCase();
    }

    if (name) customer.name = name;
    if (phone) customer.phone = phone;
    if (address !== undefined) customer.address = address;
    if (loyaltyPoints !== undefined) customer.loyaltyPoints = Number(loyaltyPoints);
    if (totalPurchases !== undefined) customer.totalPurchases = Number(totalPurchases);

    await customer.save();

    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private/Admin
exports.deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    await Customer.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    next(error);
  }
};
