const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
  shopName: { type: String, default: 'Luxury Jewels' },
  logo: { type: String, default: '' },
  favicon: { type: String, default: '' },
  whatsappNumber: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
  socialLinks: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    youtube: { type: String, default: '' },
    twitter: { type: String, default: '' },
  },
  theme: {
    primary: { type: String, default: '#D4AF37' },
    secondary: { type: String, default: '#1C1C1E' },
    accent: { type: String, default: '#F8F5F0' },
  },
  metalRates: {
    gold22k: { type: Number, default: 6500 },
    gold24k: { type: Number, default: 7100 },
    silver: { type: Number, default: 75 },
    platinum: { type: Number, default: 3200 },
  },
  aboutTitle: { type: String, default: 'Our Story' },
  aboutDescription: { type: String, default: '' },
  aboutImage: { type: String, default: '' },
  hiddenSections: [{ type: String }],
  showPrice: { type: Boolean, default: true },
  headerBanner: { type: String, default: '' },
  headerBannerImage: { type: String, default: '' },
  liveRatesText: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
