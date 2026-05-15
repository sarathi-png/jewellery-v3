const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  image: { type: String, required: true },
  link: { type: String, default: '' },
  active: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

bannerSchema.index({ active: 1, order: 1 });

module.exports = mongoose.model('Banner', bannerSchema);
