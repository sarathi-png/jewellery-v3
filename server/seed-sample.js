require('dotenv').config();
const mongoose = require('mongoose');

const Category = require('./src/models/Category');
const Product = require('./src/models/Product');

const categoriesData = [
  { name: 'Earrings', nameTamil: 'காதணிகள்', slug: 'earrings', image: 'https://images.pexels.com/photos/1375851/pexels-photo-1375851.jpeg?auto=compress&cs=tinysrgb&w=600', description: 'Beautiful earrings for every occasion', order: 10, visible: true },
  { name: 'Neckwear', nameTamil: 'கழுத்தணிகள்', slug: 'neckwear', image: 'https://images.pexels.com/photos/1375851/pexels-photo-1375851.jpeg?auto=compress&cs=tinysrgb&w=600', description: 'Elegant necklaces and chains', order: 11, visible: true },
  { name: 'Finger Jewellery', nameTamil: 'மோதிரங்கள்', slug: 'finger-jewellery', image: 'https://images.pexels.com/photos/248077/pexels-photo-248077.jpeg?auto=compress&cs=tinysrgb&w=600', description: 'Rings for every finger', order: 12, visible: true },
  { name: 'Anklets', nameTamil: 'கால் சங்கிலிகள்', slug: 'anklets', image: 'https://images.pexels.com/photos/265856/pexels-photo-265856.jpeg?auto=compress&cs=tinysrgb&w=600', description: 'Traditional and modern anklets', order: 13, visible: true },
  { name: 'Nose Jewellery', nameTamil: 'மூக்கணிகள்', slug: 'nose-jewellery', image: 'https://images.pexels.com/photos/297922/pexels-photo-297922.jpeg?auto=compress&cs=tinysrgb&w=600', description: 'Stylish nose pins and studs', order: 14, visible: true },
  { name: "Men's Jewellery", nameTamil: 'ஆண்கள் நகைகள்', slug: 'mens-jewellery', image: 'https://images.pexels.com/photos/1972609/pexels-photo-1972609.jpeg?auto=compress&cs=tinysrgb&w=600', description: 'Bold jewellery for men', order: 15, visible: true },
  { name: "Kids' Jewellery", nameTamil: 'குழந்தைகள் நகைகள்', slug: 'kids-jewellery', image: 'https://images.pexels.com/photos/2783873/pexels-photo-2783873.jpeg?auto=compress&cs=tinysrgb&w=600', description: 'Cute and safe jewellery for children', order: 16, visible: true },
  { name: 'Silver Articles', nameTamil: 'வெள்ளி பொருட்கள்', slug: 'silver-articles', image: 'https://images.pexels.com/photos/4740281/pexels-photo-4740281.jpeg?auto=compress&cs=tinysrgb&w=600', description: 'Silver utility items and gifts', order: 17, visible: true },
];

const productsData = [
  // Earrings (3)
  { name: 'Gold Jhumka Earrings', slug: 'gold-jhumka-earrings', description: 'Traditional gold jhumka earrings with intricate temple design.', categorySlug: 'earrings', images: ['https://images.pexels.com/photos/1375851/pexels-photo-1375851.jpeg?auto=compress&cs=tinysrgb&w=600'], price: 5499, comparePrice: 6999, stock: 10, sku: 'ERN-GLD-001', featured: true, trending: true, newArrival: true },
  { name: 'Diamond Stud Earrings', slug: 'diamond-stud-earrings-sample', description: 'Classic round diamond studs in 18K white gold.', categorySlug: 'earrings', images: ['https://images.pexels.com/photos/248077/pexels-photo-248077.jpeg?auto=compress&cs=tinysrgb&w=600'], price: 4999, comparePrice: 5999, stock: 15, sku: 'ERN-DIM-002', featured: true, trending: false, newArrival: false },
  { name: 'Silver Drop Earrings', slug: 'silver-drop-earrings', description: 'Elegant silver drop earrings with floral motif.', categorySlug: 'earrings', images: ['https://images.pexels.com/photos/265856/pexels-photo-265856.jpeg?auto=compress&cs=tinysrgb&w=600'], price: 1299, comparePrice: 1799, stock: 25, sku: 'ERN-SLV-003', featured: false, trending: true, newArrival: true },

  // Neckwear (3)
  { name: 'Gold Mangalsutra Necklace', slug: 'gold-mangalsutra-necklace', description: 'Traditional gold mangalsutra with black bead accents.', categorySlug: 'neckwear', images: ['https://images.pexels.com/photos/4740281/pexels-photo-4740281.jpeg?auto=compress&cs=tinysrgb&w=600'], price: 3999, comparePrice: 4999, stock: 8, sku: 'NCK-GLD-001', featured: true, trending: true, newArrival: true },
  { name: 'Pearl Choker Set', slug: 'pearl-choker-set', description: 'Elegant pearl choker necklace with matching earrings.', categorySlug: 'neckwear', images: ['https://images.pexels.com/photos/2783873/pexels-photo-2783873.jpeg?auto=compress&cs=tinysrgb&w=600'], price: 2999, comparePrice: 3999, stock: 12, sku: 'NCK-PRL-002', featured: false, trending: true, newArrival: false },
  { name: 'Silver Oxidised Necklace', slug: 'silver-oxidised-necklace', description: 'Antique oxidised silver necklace with traditional motifs.', categorySlug: 'neckwear', images: ['https://images.pexels.com/photos/297922/pexels-photo-297922.jpeg?auto=compress&cs=tinysrgb&w=600'], price: 899, comparePrice: 1299, stock: 30, sku: 'NCK-SLV-003', featured: false, trending: false, newArrival: true },

  // Finger Jewellery (3)
  { name: 'Gold Wedding Ring', slug: 'gold-wedding-ring', description: '22K gold wedding ring with polished finish.', categorySlug: 'finger-jewellery', images: ['https://images.pexels.com/photos/1972609/pexels-photo-1972609.jpeg?auto=compress&cs=tinysrgb&w=600'], price: 3499, comparePrice: 4499, stock: 20, sku: 'RNG-GLD-001', featured: true, trending: true, newArrival: false },
  { name: 'Silver Statement Ring', slug: 'silver-statement-ring', description: 'Bold silver ring with gemstone accent.', categorySlug: 'finger-jewellery', images: ['https://images.pexels.com/photos/991831/pexels-photo-991831.jpeg?auto=compress&cs=tinysrgb&w=600'], price: 699, comparePrice: 999, stock: 35, sku: 'RNG-SLV-002', featured: false, trending: false, newArrival: true },
  { name: 'Platinum Band Ring', slug: 'platinum-band-ring', description: 'Sleek platinum band ring for daily wear.', categorySlug: 'finger-jewellery', images: ['https://images.pexels.com/photos/248077/pexels-photo-248077.jpeg?auto=compress&cs=tinysrgb&w=600'], price: 4499, comparePrice: 5499, stock: 5, sku: 'RNG-PLT-003', featured: true, trending: false, newArrival: true },

  // Anklets (3)
  { name: 'Gold Anklet with Bells', slug: 'gold-anklet-bells', description: 'Traditional gold anklet with delicate bell charms.', categorySlug: 'anklets', images: ['https://images.pexels.com/photos/1375851/pexels-photo-1375851.jpeg?auto=compress&cs=tinysrgb&w=600'], price: 2499, comparePrice: 3499, stock: 10, sku: 'ANK-GLD-001', featured: true, trending: true, newArrival: true },
  { name: 'Silver Filigree Anklet', slug: 'silver-filigree-anklet', description: 'Intricate silver filigree work anklet with adjustable chain.', categorySlug: 'anklets', images: ['https://images.pexels.com/photos/265856/pexels-photo-265856.jpeg?auto=compress&cs=tinysrgb&w=600'], price: 999, comparePrice: 1499, stock: 18, sku: 'ANK-SLV-002', featured: false, trending: false, newArrival: false },
  { name: 'Pearl Anklet', slug: 'pearl-anklet', description: 'Beautiful pearl anklet with gold-plated accents.', categorySlug: 'anklets', images: ['https://images.pexels.com/photos/297922/pexels-photo-297922.jpeg?auto=compress&cs=tinysrgb&w=600'], price: 799, comparePrice: 1199, stock: 22, sku: 'ANK-PRL-003', featured: false, trending: true, newArrival: true },

  // Nose Jewellery (3)
  { name: 'Gold Nose Pin', slug: 'gold-nose-pin', description: '22K gold nose pin with floral design.', categorySlug: 'nose-jewellery', images: ['https://images.pexels.com/photos/297922/pexels-photo-297922.jpeg?auto=compress&cs=tinysrgb&w=600'], price: 499, comparePrice: 699, stock: 40, sku: 'NSE-GLD-001', featured: true, trending: true, newArrival: true },
  { name: 'Diamond Nose Stud', slug: 'diamond-nose-stud', description: 'Solitaire diamond nose stud in 18K gold setting.', categorySlug: 'nose-jewellery', images: ['https://images.pexels.com/photos/248077/pexels-photo-248077.jpeg?auto=compress&cs=tinysrgb&w=600'], price: 2999, comparePrice: 3999, stock: 8, sku: 'NSE-DIM-002', featured: true, trending: false, newArrival: false },
  { name: 'Silver Nose Ring', slug: 'silver-nose-ring', description: 'Sterling silver nose ring with adjustable screw.', categorySlug: 'nose-jewellery', images: ['https://images.pexels.com/photos/265856/pexels-photo-265856.jpeg?auto=compress&cs=tinysrgb&w=600'], price: 299, comparePrice: 499, stock: 50, sku: 'NSE-SLV-003', featured: false, trending: true, newArrival: true },

  // Men's Jewellery (3)
  { name: 'Gold Men\'s Chain', slug: 'gold-mens-chain', description: 'Heavy 22K gold chain for men with link design.', categorySlug: 'mens-jewellery', images: ['https://images.pexels.com/photos/1972609/pexels-photo-1972609.jpeg?auto=compress&cs=tinysrgb&w=600'], price: 4999, comparePrice: 6499, stock: 6, sku: 'MEN-GLD-001', featured: true, trending: true, newArrival: true },
  { name: 'Silver Men\'s Bracelet', slug: 'silver-mens-bracelet', description: 'Bold silver bracelet with engraved patterns.', categorySlug: 'mens-jewellery', images: ['https://images.pexels.com/photos/991831/pexels-photo-991831.jpeg?auto=compress&cs=tinysrgb&w=600'], price: 1499, comparePrice: 1999, stock: 15, sku: 'MEN-SLV-002', featured: false, trending: false, newArrival: false },
  { name: 'Men\'s Tungsten Ring', slug: 'mens-tungsten-ring', description: 'Premium tungsten carbide ring with matte finish.', categorySlug: 'mens-jewellery', images: ['https://images.pexels.com/photos/248077/pexels-photo-248077.jpeg?auto=compress&cs=tinysrgb&w=600'], price: 1999, comparePrice: 2999, stock: 12, sku: 'MEN-TNG-003', featured: false, trending: true, newArrival: true },

  // Kids' Jewellery (3)
  { name: 'Kids Gold Stud Earrings', slug: 'kids-gold-stud-earrings', description: 'Small gold stud earrings safe for children.', categorySlug: 'kids-jewellery', images: ['https://images.pexels.com/photos/1375851/pexels-photo-1375851.jpeg?auto=compress&cs=tinysrgb&w=600'], price: 1499, comparePrice: 1999, stock: 20, sku: 'KID-GLD-001', featured: true, trending: true, newArrival: true },
  { name: 'Kids Silver Anklet', slug: 'kids-silver-anklet', description: 'Lightweight silver anklet with tiny bell charms.', categorySlug: 'kids-jewellery', images: ['https://images.pexels.com/photos/265856/pexels-photo-265856.jpeg?auto=compress&cs=tinysrgb&w=600'], price: 599, comparePrice: 899, stock: 25, sku: 'KID-SLV-002', featured: false, trending: false, newArrival: true },
  { name: 'Kids Beaded Bracelet', slug: 'kids-beaded-bracelet', description: 'Colourful beaded bracelet with gold-plated charms.', categorySlug: 'kids-jewellery', images: ['https://images.pexels.com/photos/297922/pexels-photo-297922.jpeg?auto=compress&cs=tinysrgb&w=600'], price: 399, comparePrice: 599, stock: 30, sku: 'KID-BD-003', featured: false, trending: true, newArrival: false },

  // Silver Articles (3)
  { name: 'Silver Pooja Thali', slug: 'silver-pooja-thali', description: 'Traditional silver pooja thali set with accessories.', categorySlug: 'silver-articles', images: ['https://images.pexels.com/photos/4740281/pexels-photo-4740281.jpeg?auto=compress&cs=tinysrgb&w=600'], price: 3499, comparePrice: 4499, stock: 7, sku: 'ART-SLV-001', featured: true, trending: true, newArrival: true },
  { name: 'Silver Photo Frame', slug: 'silver-photo-frame', description: 'Beautiful silver photo frame with ornate detailing.', categorySlug: 'silver-articles', images: ['https://images.pexels.com/photos/2783873/pexels-photo-2783873.jpeg?auto=compress&cs=tinysrgb&w=600'], price: 1999, comparePrice: 2799, stock: 10, sku: 'ART-SLV-002', featured: false, trending: false, newArrival: false },
  { name: 'Silver Tea Set', slug: 'silver-tea-set', description: 'Elegant silver tea set with 4 cups and tray.', categorySlug: 'silver-articles', images: ['https://images.pexels.com/photos/991831/pexels-photo-991831.jpeg?auto=compress&cs=tinysrgb&w=600'], price: 4499, comparePrice: 5999, stock: 4, sku: 'ART-SLV-003', featured: true, trending: false, newArrival: true },
];

async function seedSample() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const categoryMap = {};

    for (const catData of categoriesData) {
      const cat = await Category.findOneAndUpdate(
        { slug: catData.slug },
        { $setOnInsert: catData },
        { upsert: true, new: true }
      );
      categoryMap[cat.slug] = cat._id;
      console.log(`Category: ${cat.name} (${cat._id})`);
    }

    let productCount = 0;
    for (const prodData of productsData) {
      const { categorySlug, ...prodFields } = prodData;
      const existing = await Product.findOne({ slug: prodFields.slug });
      if (!existing) {
        await Product.create({
          ...prodFields,
          category: categoryMap[categorySlug],
          visible: true,
        });
        productCount++;
        console.log(`Product created: ${prodFields.name}`);
      } else {
        console.log(`Product exists (skipped): ${prodFields.name}`);
      }
    }

    console.log(`\nSeed sample complete!`);
    console.log(`Categories: ${Object.keys(categoryMap).length}`);
    console.log(`New products added: ${productCount}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seed sample error:', error);
    process.exit(1);
  }
}

seedSample();
