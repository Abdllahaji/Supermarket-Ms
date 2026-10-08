const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  oldPrice: { type: Number, required: true },
  newPrice: { type: Number, required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PriceHistory', priceHistorySchema);
