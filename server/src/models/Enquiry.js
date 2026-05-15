const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, default: '' },
  message: { type: String, default: '' },
  status: {
    type: String,
    enum: ['new', 'read', 'replied'],
    default: 'new',
  },
}, { timestamps: true });

enquirySchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Enquiry', enquirySchema);
