import { Helmet } from '@/lib/helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Gem, Truck, BadgeCheck } from 'lucide-react';
import HeroSlider from '@/components/home/HeroSlider';
import CategoryGrid from '@/components/home/CategoryGrid';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import TestimonialsCarousel from '@/components/home/TestimonialsCarousel';
import { useProducts } from '@/hooks/useProducts';
import { useSiteSettings } from '@/context/SettingsContext';
import ProductCard from '@/components/products/ProductCard';

const benefits = [
  { icon: Shield, text: 'BIS Hallmarked Jewellery' },
  { icon: Gem, text: 'Certified Diamonds' },
  { icon: BadgeCheck, text: 'Lifetime Buyback' },
  { icon: Truck, text: 'Free Insured Shipping' },
];

export default function Home() {
  const { products: trending } = useProducts({ trending: true, visible: true, limit: 4 });
  const { settings } = useSiteSettings();

  return (
    <>
      <Helmet>
        <title>{settings?.shopName || 'Luxury Jewels'} | Premium Fine Jewellery</title>
        <meta name="description" content={settings?.aboutDescription || 'Discover exquisite gold, diamond, silver and platinum jewellery collections.'} />
      </Helmet>

      <HeroSlider />

      <section className="py-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8">
            {benefits.map((b) => (
              <div key={b.text} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                  <b.icon className="w-5 h-5 text-amber-600" />
                </div>
                <span className="text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300">{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CategoryGrid />

      <FeaturedProducts />

      {trending.length > 0 && (
        <section className="py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl lg:text-4xl font-serif font-bold text-gray-900 dark:text-white">
                  Trending Now
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Most popular pieces this season</p>
              </div>
              <Link to="/products?trending=true" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trending.map((product, i) => (
                <ProductCard key={product._id} product={product} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 lg:py-20 bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-serif font-bold mb-4">
              Exclusively Crafted for You
            </h2>
            <p className="text-amber-100 max-w-xl mx-auto mb-8">
              Every piece tells a story. Let us help you find the perfect jewellery for your special moments.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-amber-900 font-medium rounded-full hover:bg-amber-50 transition-colors shadow-lg"
            >
              Explore Collection <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      <TestimonialsCarousel />
    </>
  );
}
