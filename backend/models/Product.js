const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  barcode: { type: String, required: true, unique: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['Fruits & Vegetables', 'Dairy & Eggs', 'Meat & Seafood', 'Bakery', 'Beverages', 'Snacks', 'Canned Goods', 'Frozen Foods', 'Household', 'Personal Care', 'Other'] 
  },
  description: { type: String },
  quantity: { type: Number, required: true, default: 0 },
  minStock: { type: Number, default: 10 },
  price: { type: Number, required: true },
  costPrice: { type: Number, required: true },
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  image: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
