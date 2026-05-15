const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameTamil: { type: String, default: '' },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  descriptionTamil: { type: String, default: '' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  images: [{ type: String }],
  weight: { type: Number, default: 0 },
  purity: { type: String, default: '22K' },
  price: { type: Number, default: 0 },
  comparePrice: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  sku: { type: String, default: '' },
  featured: { type: Boolean, default: false },
  trending: { type: Boolean, default: false },
  newArrival: { type: Boolean, default: false },
  visible: { type: Boolean, default: true },
  specifications: [{ label: String, value: String }],
}, { timestamps: true });

productSchema.index({ category: 1, visible: 1 });
productSchema.index({ name: 'text', description: 'text', sku: 'text' });

module.exports = mongoose.model('Product', productSchema);
