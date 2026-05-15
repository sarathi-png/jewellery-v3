const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  location: { type: String, default: '' },
  rating: { type: Number, default: 5, min: 1, max: 5 },
  avatar: { type: String, default: '' },
  review: { type: String, required: true },
  verified: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);
