const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, required: true },
  address: { type: String },
  loyaltyPoints: { type: Number, default: 0 },
  totalPurchases: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Customer', customerSchema);
