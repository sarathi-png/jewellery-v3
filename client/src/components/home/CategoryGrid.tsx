import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { getImageUrl } from '@/lib/utils';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function CategoryGrid() {
  const { categories, loading } = useCategories();

  if (loading || !categories.length) return null;

  const visibleCategories = categories.filter((c) => c.visible);

  return (
    <section className="py-16 lg:py-20 bg-accent dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl lg:text-4xl font-serif font-bold text-gray-900 dark:text-white">
            Shop by Category
          </h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
            Explore our curated collections of finest jewellery
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6"
        >
          {visibleCategories.map((cat) => (
            <motion.div key={cat._id} variants={item}>
              <Link
                to={`/products?category=${cat.slug}`}
                className="group relative block aspect-square rounded-2xl overflow-hidden bg-gray-200 hover:scale-105 hover:rotate-[1deg] hover:shadow-2xl transition-transform duration-500"
              >
                <img
                  src={getImageUrl(cat.image)}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6">
                  <h3 className="text-lg lg:text-xl font-serif font-semibold text-white">
                    {cat.name}
                  </h3>
                  {cat.productCount > 0 && (
                    <p className="text-sm text-gray-300 mt-1">{cat.productCount} pieces</p>
                  )}
                </div>
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center mt-8">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium transition-colors"
          >
            View All Collections <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
