import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProducts } from '@/hooks/useProducts';

export default function FeaturedProducts() {
  const { products, loading } = useProducts({ featured: true, visible: true, limit: 4 });

  if (loading || !products.length) return null;

  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-gray-900 dark:text-white">
              Featured Collection
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Our most exquisite handpicked pieces
            </p>
          </div>
          <Link
            to="/products"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
          >
            View All
          </Link>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {products.map((product) => (
            <motion.div
              key={product._id}
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
            >
              <Link to={`/products/${product.slug}`} className="group block">
                <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3">
                  <img
                    src={product.images?.[0] || '/placeholder.svg'}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-amber-600 transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">{product.purity} · {product.weight}g</p>
                <p className="mt-1.5 text-lg font-semibold text-amber-600">
                  ₹{product.price.toLocaleString()}
                </p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
