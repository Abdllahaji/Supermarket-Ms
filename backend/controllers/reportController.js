const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

// @desc    Sales Analytics Report
// @route   GET /api/reports/sales
// @access  Private/Admin
exports.salesReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    } else {
      // Default to last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query.createdAt = { $gte: thirtyDaysAgo };
    }

    const sales = await Sale.find(query).sort({ createdAt: 1 });

    const totalSales = sales.length;
    const totalRevenue = sales.reduce((acc, s) => acc + s.totalAmount, 0);
    const averageTransaction = totalSales > 0 ? (totalRevenue / totalSales) : 0;

    // Payment Method Breakdown
    let cashSales = 0;
    let cardSales = 0;
    let cashRevenue = 0;
    let cardRevenue = 0;

    // Daily breakdown map
    const dailyMap = {};

    sales.forEach(sale => {
      if (sale.paymentMethod === 'card') {
        cardSales += 1;
        cardRevenue += sale.totalAmount;
      } else {
        cashSales += 1;
        cashRevenue += sale.totalAmount;
      }

      const dateKey = new Date(sale.createdAt).toISOString().split('T')[0];
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { date: dateKey, count: 0, revenue: 0 };
      }
      dailyMap[dateKey].count += 1;
      dailyMap[dateKey].revenue += sale.totalAmount;
    });

    const dailyBreakdown = Object.values(dailyMap).map(d => ({
      ...d,
      revenue: Number(d.revenue.toFixed(2))
    }));

    res.status(200).json({
      success: true,
      data: {
        totalSales,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        averageTransaction: Number(averageTransaction.toFixed(2)),
        paymentMethodBreakdown: {
          cash: { count: cashSales, revenue: Number(cashRevenue.toFixed(2)) },
          card: { count: cardSales, revenue: Number(cardRevenue.toFixed(2)) }
        },
        dailyBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Product Inventory Report
// @route   GET /api/reports/products
// @access  Private/Admin
exports.productReport = async (req, res, next) => {
  try {
    const products = await Product.find()
      .populate('location', 'branch section shelf aisle')
      .sort({ quantity: 1 });

    // Calculate total sold per product from all sales
    const productSales = await Sale.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' }
        }
      }
    ]);

    const salesMap = {};
    productSales.forEach(ps => {
      if (ps._id) {
        salesMap[ps._id.toString()] = ps;
      }
    });

    const reportData = products.map(prod => {
      const soldStats = salesMap[prod._id.toString()] || { totalSold: 0, totalRevenue: 0 };
      return {
        _id: prod._id,
        name: prod.name,
        barcode: prod.barcode,
        category: prod.category,
        quantity: prod.quantity,
        minStock: prod.minStock,
        price: prod.price,
        costPrice: prod.costPrice,
        inventoryValue: Number((prod.price * prod.quantity).toFixed(2)),
        totalSold: soldStats.totalSold,
        totalRevenue: Number((soldStats.totalRevenue || 0).toFixed(2)),
        location: prod.location ? `${prod.location.branch} - ${prod.location.section}` : 'N/A',
        isLowStock: prod.quantity <= prod.minStock,
        status: prod.status
      };
    });

    const totalInventoryValue = reportData.reduce((sum, item) => sum + item.inventoryValue, 0);
    const lowStockCount = reportData.filter(i => i.isLowStock).length;

    res.status(200).json({
      success: true,
      data: reportData,
      summary: {
        totalProducts: products.length,
        lowStockCount,
        totalInventoryValue: Number(totalInventoryValue.toFixed(2))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Customer Performance Report
// @route   GET /api/reports/customers
// @access  Private/Admin
exports.customerReport = async (req, res, next) => {
  try {
    const customers = await Customer.find().sort({ totalPurchases: -1 });

    // Aggregate sale counts per customer
    const customerSales = await Sale.aggregate([
      { $match: { customer: { $ne: null } } },
      {
        $group: {
          _id: '$customer',
          saleCount: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' }
        }
      }
    ]);

    const salesMap = {};
    customerSales.forEach(cs => {
      if (cs._id) {
        salesMap[cs._id.toString()] = cs;
      }
    });

    const reportData = customers.map(c => {
      const stats = salesMap[c._id.toString()] || { saleCount: 0, totalSpent: 0 };
      return {
        _id: c._id,
        name: c.name,
        email: c.email || 'N/A',
        phone: c.phone,
        loyaltyPoints: c.loyaltyPoints,
        totalPurchases: Number(c.totalPurchases.toFixed(2)),
        saleCount: stats.saleCount,
        createdAt: c.createdAt
      };
    });

    res.status(200).json({
      success: true,
      data: reportData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Revenue Trends Report
// @route   GET /api/reports/revenue
// @access  Private/Admin
exports.revenueReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    } else {
      // Default to last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query.createdAt = { $gte: thirtyDaysAgo };
    }

    const sales = await Sale.find(query).sort({ createdAt: 1 });

    const totalRevenue = sales.reduce((acc, s) => acc + s.totalAmount, 0);

    const dailyMap = {};
    sales.forEach(s => {
      const dateKey = new Date(s.createdAt).toISOString().split('T')[0];
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = 0;
      }
      dailyMap[dateKey] += s.totalAmount;
    });

    const dailyBreakdown = Object.keys(dailyMap).map(date => ({
      date,
      revenue: Number(dailyMap[date].toFixed(2))
    }));

    // Find best day
    let bestDay = { date: 'N/A', revenue: 0 };
    dailyBreakdown.forEach(item => {
      if (item.revenue > bestDay.revenue) {
        bestDay = item;
      }
    });

    const totalDays = dailyBreakdown.length || 1;
    const averageDaily = totalRevenue / totalDays;

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        averageDaily: Number(averageDaily.toFixed(2)),
        bestDay,
        dailyBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};
