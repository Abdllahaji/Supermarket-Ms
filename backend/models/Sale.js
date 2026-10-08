const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  invoiceNumber: { type: String, unique: true },
  cashier: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: String,
    productBarcode: String,
    price: Number,
    quantity: Number,
    discount: { type: Number, default: 0 },
    subtotal: Number
  }],
  subtotal: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cash', 'card'], default: 'cash' },
  amountPaid: { type: Number, required: true },
  change: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sale', saleSchema);
