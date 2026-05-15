const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameTamil: { type: String, default: '' },
  slug: { type: String, required: true, unique: true },
  image: { type: String, default: '' },
  description: { type: String, default: '' },
  descriptionTamil: { type: String, default: '' },
  order: { type: Number, default: 0 },
  visible: { type: Boolean, default: true },
}, { timestamps: true });

categorySchema.index({ order: 1 });

module.exports = mongoose.model('Category', categorySchema);
