require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

const Admin = require('./src/models/Admin');
const Category = require('./src/models/Category');
const Product = require('./src/models/Product');
const Banner = require('./src/models/Banner');
const Offer = require('./src/models/Offer');
const Testimonial = require('./src/models/Testimonial');
const SiteSettings = require('./src/models/SiteSettings');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Promise.all([
      Admin.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Banner.deleteMany({}),
      Offer.deleteMany({}),
      Testimonial.deleteMany({}),
      SiteSettings.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    const admin = await Admin.create({
      name: process.env.ADMIN_NAME || 'Shop Owner',
      email: process.env.ADMIN_EMAIL || 'admin@jewels.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role: 'super_admin',
    });
    console.log(`Admin created: ${admin.email}`);

    const categories = await Category.insertMany([
      { name: 'Gold', nameTamil: 'தங்கம்', slug: 'gold', image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600', description: 'Pure gold jewellery for every occasion', order: 1, visible: true },
      { name: 'Silver', nameTamil: 'வெள்ளி', slug: 'silver', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600', description: 'Elegant silver collections', order: 2, visible: true },
      { name: 'Diamond', nameTamil: 'வைரம்', slug: 'diamond', image: 'https://images.pexels.com/photos/248077/pexels-photo-248077.jpeg?auto=compress&cs=tinysrgb&w=600', description: 'Exquisite diamond jewellery', order: 3, visible: true },
      { name: 'Platinum', nameTamil: 'பிளாட்டினம்', slug: 'platinum', image: 'https://images.pexels.com/photos/991831/pexels-photo-991831.jpeg?auto=compress&cs=tinysrgb&w=600', description: 'Premium platinum collections', order: 4, visible: true },
    ]);
    console.log(`Categories seeded: ${categories.length}`);

    const products = await Product.insertMany([
      { name: '22K Gold Necklace', slug: '22k-gold-necklace', description: 'Elegant handcrafted 22K gold necklace with intricate traditional design. Perfect for weddings and festive occasions.', category: categories[0]._id, images: ['https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600', 'https://images.unsplash.com/photo-1608042314453-ae338d80c427?w=600'], weight: 25.5, purity: '22K', price: 165750, comparePrice: 185000, stock: 5, sku: 'GLD-NCK-001', featured: true, trending: true, newArrival: true, visible: true, specifications: [{ label: 'Metal Type', value: '22K Yellow Gold' }, { label: 'Weight', value: '25.5 g' }, { label: 'Length', value: '18 inches' }, { label: 'Clasp', value: 'Adjustable Hook' }] },
      { name: '24K Gold Bangles', slug: '24k-gold-bangles', description: 'Traditional 24K gold bangles set with polished finish. Set of 2 bangles with classic design.', category: categories[0]._id, images: ['https://images.unsplash.com/photo-1608042314453-ae338d80c427?w=600'], weight: 40, purity: '24K', price: 284000, comparePrice: 0, stock: 3, sku: 'GLD-BNG-002', featured: true, trending: false, newArrival: false, visible: true, specifications: [{ label: 'Metal Type', value: '24K Yellow Gold' }, { label: 'Weight', value: '40 g (pair)' }, { label: 'Size', value: '2.4 inches' }] },
      { name: 'Diamond Stud Earrings', slug: 'diamond-stud-earrings', description: 'Brilliant round-cut diamond stud earrings in 18K white gold setting. Certified diamonds with GIA certificate.', category: categories[2]._id, images: ['https://images.pexels.com/photos/248077/pexels-photo-248077.jpeg?auto=compress&cs=tinysrgb&w=600', 'https://images.pexels.com/photos/265856/pexels-photo-265856.jpeg?auto=compress&cs=tinysrgb&w=600'], weight: 3.2, purity: '18K', price: 85000, comparePrice: 95000, stock: 10, sku: 'DIM-ER-001', featured: true, trending: true, newArrival: true, visible: true, specifications: [{ label: 'Stone', value: 'Diamond (1.5 ct)' }, { label: 'Setting', value: 'Prong' }, { label: 'Metal', value: '18K White Gold' }, { label: 'Certification', value: 'GIA' }] },
      { name: 'Silver Antique Pendant', slug: 'silver-antique-pendant', description: 'Vintage-inspired antique silver pendant with traditional motifs. Oxidised finish for an antique look.', category: categories[1]._id, images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600'], weight: 15, purity: 'Silver 925', price: 4500, comparePrice: 5500, stock: 20, sku: 'SLV-PND-001', featured: false, trending: true, newArrival: false, visible: true, specifications: [{ label: 'Metal', value: '925 Sterling Silver' }, { label: 'Weight', value: '15 g' }, { label: 'Finish', value: 'Oxidised Antique' }, { label: 'Chain', value: 'Included (45 cm)' }] },
      { name: 'Platinum Diamond Ring', slug: 'platinum-diamond-ring', description: 'Luxurious platinum ring with a solitaire diamond. Modern design perfect for engagements.', category: categories[3]._id, images: ['https://images.pexels.com/photos/991831/pexels-photo-991831.jpeg?auto=compress&cs=tinysrgb&w=600', 'https://images.pexels.com/photos/1972609/pexels-photo-1972609.jpeg?auto=compress&cs=tinysrgb&w=600'], weight: 8.5, purity: 'PT950', price: 195000, comparePrice: 220000, stock: 2, sku: 'PLT-RNG-001', featured: true, trending: false, newArrival: true, visible: true, specifications: [{ label: 'Metal', value: 'PT950 Platinum' }, { label: 'Diamond', value: '0.5 ct Solitaire' }, { label: 'Ring Size', value: '6 (US)' }, { label: 'Certification', value: 'IGI' }] },

      { name: 'Silver Bracelet', slug: 'silver-bracelet', description: 'Modern silver bracelet for daily wear. Lightweight and stylish design.', category: categories[1]._id, images: ['https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600'], weight: 12, purity: 'Silver 925', price: 3200, comparePrice: 0, stock: 15, sku: 'SLV-BRC-002', featured: false, trending: false, newArrival: false, visible: true, specifications: [{ label: 'Metal', value: '925 Sterling Silver' }, { label: 'Weight', value: '12 g' }, { label: 'Length', value: '7.5 inches' }] },
      { name: 'Diamond Necklace Set', slug: 'diamond-necklace-set', description: 'Complete diamond necklace and earring set in 18K gold. Stunning for special occasions.', category: categories[2]._id, images: ['https://images.pexels.com/photos/2783873/pexels-photo-2783873.jpeg?auto=compress&cs=tinysrgb&w=600', 'https://images.pexels.com/photos/265856/pexels-photo-265856.jpeg?auto=compress&cs=tinysrgb&w=600', 'https://images.pexels.com/photos/248077/pexels-photo-248077.jpeg?auto=compress&cs=tinysrgb&w=600'], weight: 28, purity: '18K', price: 450000, comparePrice: 520000, stock: 1, sku: 'DIM-NCK-002', featured: true, trending: true, newArrival: false, visible: true, specifications: [{ label: 'Metal', value: '18K White Gold' }, { label: 'Total Diamond', value: '5.2 ct' }, { label: 'Necklace Length', value: '16 inches' }, { label: 'Set Includes', value: 'Necklace + Earrings' }] },
      { name: 'Platinum Chain', slug: 'platinum-chain', description: 'Elegant platinum chain with modern link design. Lightweight yet durable for daily wear or special occasions.', category: categories[3]._id, images: ['https://images.pexels.com/photos/297922/pexels-photo-297922.jpeg?auto=compress&cs=tinysrgb&w=600', 'https://images.pexels.com/photos/4740281/pexels-photo-4740281.jpeg?auto=compress&cs=tinysrgb&w=600'], weight: 12, purity: 'PT950', price: 185000, comparePrice: 210000, stock: 4, sku: 'PLT-CHN-002', featured: false, trending: true, newArrival: true, visible: true, specifications: [{ label: 'Metal', value: 'PT950 Platinum' }, { label: 'Weight', value: '12 g' }, { label: 'Length', value: '20 inches' }, { label: 'Clasp', value: 'Lobster' }] },
    ]);
    console.log(`Products seeded: ${products.length}`);

    await Banner.insertMany([
      { title: 'Elegant Gold Collection', subtitle: 'Discover our handcrafted 22K gold jewellery', image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=1400', link: '/products?category=gold', active: true, order: 1 },
      { title: 'Dazzling Diamonds', subtitle: 'Certified diamonds at exceptional prices', image: 'https://images.pexels.com/photos/2783873/pexels-photo-2783873.jpeg?auto=compress&cs=tinysrgb&w=1400', link: '/products?category=diamond', active: true, order: 2 },
      { title: 'Timeless Silver', subtitle: 'Elegant silver jewellery for every day', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1400', link: '/products?category=silver', active: true, order: 3 },
      { title: 'Platinum Elegance', subtitle: 'Discover our premium platinum collection', image: 'https://images.pexels.com/photos/1972609/pexels-photo-1972609.jpeg?auto=compress&cs=tinysrgb&w=1400', link: '/products?category=platinum', active: true, order: 4 },
    ]);

    await Offer.insertMany([
      { title: 'Grand Wedding Sale', description: 'Up to 20% off on all gold jewellery. Exclusive bridal collection now available.', image: 'https://images.pexels.com/photos/4740281/pexels-photo-4740281.jpeg?auto=compress&cs=tinysrgb&w=800', link: '/products', active: true },
      { title: 'Free Diamond Setting', description: 'Free diamond setting on all platinum rings purchased this month.', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800', link: '/products?category=platinum', active: true },
    ]);

    await Testimonial.insertMany([
      { customerName: 'Priya Sharma', location: 'Mumbai', rating: 5, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', review: 'Absolutely stunning jewellery! The quality and craftsmanship are exceptional. Highly recommend for wedding shopping.' },
      { customerName: 'Rahul Verma', location: 'Delhi', rating: 5, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', review: 'Bought a diamond ring for my fiancee. She loved it! Great quality and the certificate gave us confidence.' },
      { customerName: 'Ananya Patel', location: 'Chennai', rating: 4, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', review: 'Beautiful silver collection. The antique pendant set is my favorite. Fast delivery and great packaging.' },
    ]);

    await SiteSettings.create({
      shopName: 'Luxury Jewels',
      logo: 'https://images.pexels.com/photos/265856/pexels-photo-265856.jpeg?auto=compress&cs=tinysrgb&w=200',
      whatsappNumber: '919876543210',
      phone: '+91 98765 43210',
      email: 'hello@luxuryjewels.com',
      address: '42, Jewel Avenue, Anna Nagar, Chennai - 600040, Tamil Nadu, India',
      socialLinks: { facebook: '#', instagram: '#', youtube: '#', twitter: '#' },
      theme: { primary: '#D4AF37', secondary: '#1C1C1E', accent: '#F8F5F0' },
      metalRates: { gold22k: 6500, gold24k: 7100, silver: 75, platinum: 3200 },
      aboutTitle: 'Our Story',
      aboutDescription: 'For over three generations, Luxury Jewels has been a beacon of trust and exquisite craftsmanship in fine jewellery. Founded in 1975, our journey began in the heart of Chennai with a vision to bring the finest gold, diamond, silver, and platinum jewellery to discerning customers. Every piece we create tells a story — of tradition, of precision, and of timeless beauty. Our master craftsmen combine age-old techniques with modern design sensibilities to create jewellery that transcends generations.',
      aboutImage: 'https://images.pexels.com/photos/2783873/pexels-photo-2783873.jpeg?auto=compress&cs=tinysrgb&w=1200',
      hiddenSections: [],
      showPrice: true,
      headerBanner: '',
      liveRatesText: 'Gold ₹7,100/g | Silver ₹75/g',
    });

    console.log('Seed data inserted successfully!');
    console.log(`Admin login: ${process.env.ADMIN_EMAIL || 'admin@jewels.com'} / ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
