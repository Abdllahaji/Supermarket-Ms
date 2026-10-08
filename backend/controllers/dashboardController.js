const Product = require('../models/Product');
const Customer = require('../models/Customer');
const User = require('../models/User');
const Sale = require('../models/Sale');
const Discount = require('../models/Discount');

// @desc    Get complete dashboard overview statistics
// @route   GET /api/dashboard/stats
// @access  Private
exports.getStats = async (req, res, next) => {
  try {
    const now = new Date();
    
    // Start & end of today
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Start of current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);

    // Counts
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await Customer.countDocuments();
    const totalCashiers = await User.countDocuments({ role: 'cashier' });
    const totalSales = await Sale.countDocuments();

    // Low stock products count
    const lowStockProducts = await Product.countDocuments({
      $expr: { $lte: ['$quantity', '$minStock'] }
    });

    // Active discounts count
    const activeDiscounts = await Discount.countDocuments({
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now }
    });

    // Today's revenue
    const todaySales = await Sale.find({
      createdAt: { $gte: startOfToday, $lte: endOfToday }
    });
    const todayRevenue = todaySales.reduce((acc, curr) => acc + curr.totalAmount, 0);

    // Month's revenue
    const monthSales = await Sale.find({
      createdAt: { $gte: startOfMonth }
    });
    const monthRevenue = monthSales.reduce((acc, curr) => acc + curr.totalAmount, 0);

    // Recent 5 Sales
    const recentSales = await Sale.find()
      .populate('cashier', 'name')
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 })
      .limit(5);

    // Top 5 Products sold
    const topProductsAgg = await Sale.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.productName' },
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    // Monthly Sales Trend for past 6 months
    const monthlySalesData = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

      const mSales = await Sale.find({
        createdAt: { $gte: mStart, $lte: mEnd }
      });

      const rev = mSales.reduce((sum, s) => sum + s.totalAmount, 0);
      monthlySalesData.push({
        month: monthNames[d.getMonth()],
        year: d.getFullYear(),
        revenue: Number(rev.toFixed(2)),
        orders: mSales.length
      });
    }

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalCustomers,
        totalCashiers,
        totalSales,
        lowStockProducts,
        activeDiscounts,
        todayRevenue: Number(todayRevenue.toFixed(2)),
        monthRevenue: Number(monthRevenue.toFixed(2)),
        recentSales,
        topProducts: topProductsAgg,
        monthlySalesData
      }
    });
  } catch (error) {
    next(error);
  }
};
