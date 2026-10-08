const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  branch: { type: String, required: true },
  section: { type: String, required: true },
  shelf: { type: String },
  aisle: { type: String },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Location', locationSchema);
