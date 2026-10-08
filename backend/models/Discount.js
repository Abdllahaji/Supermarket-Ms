const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['percentage', 'fixed'], required: true },
  value: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  categories: [String],
  minPurchase: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Discount', discountSchema);
