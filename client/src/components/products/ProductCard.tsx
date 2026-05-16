import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Eye, MessageCircle } from 'lucide-react';
import { cn, formatCurrency, getImageUrl, getWhatsAppUrl } from '@/lib/utils';
import { useSiteSettings } from '@/context/SettingsContext';
import { useCart } from '@/context/CartContext';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    images: string[];
    price: number;
    comparePrice: number;
    purity: string;
    weight: number;
    stock: number;
    featured: boolean;
    trending: boolean;
    newArrival: boolean;
    category: { _id: string; name: string; slug: string };
  };
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { settings } = useSiteSettings();
  const { addItem } = useCart();
  const discount = product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product._id,
      slug: product.slug,
      name: product.name,
      image: product.images?.[0] || '',
      price: product.price,
      weight: product.weight,
      purity: product.purity,
    });
    toast.success('Added to cart');
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (settings?.whatsappNumber) {
      const msg = `Hello! I'm interested in ${product.name} (${product.purity}, ${product.weight}g). Price: ₹${product.price.toLocaleString()}.`;
      window.open(getWhatsAppUrl(settings.whatsappNumber, msg), '_blank');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 4) * 0.1 }}
    >
      <Link to={`/products/${product.slug}`} className="group block">
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-3 hover:scale-105 hover:rotate-[2deg] hover:shadow-2xl transition-transform duration-300">
          <img
            src={getImageUrl(product.images?.[0])}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.newArrival && <Badge variant="gold">New</Badge>}
            {product.trending && <Badge variant="warning">Trending</Badge>}
            {discount > 0 && <Badge variant="danger">-{discount}%</Badge>}
          </div>

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white font-medium text-sm bg-black/60 px-4 py-1.5 rounded-full">Out of Stock</span>
            </div>
          )}

          <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="p-2.5 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-amber-500 hover:text-white transition-all disabled:opacity-50"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
            <button
              onClick={handleWhatsApp}
              className="p-2.5 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-green-500 hover:text-white transition-all"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {product.category && (
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
            {product.category.name}
          </p>
        )}
        <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-amber-600 transition-colors truncate">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {product.purity} · {product.weight}g
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          {settings?.showPrice !== false && (
            <>
              <span className="text-lg font-semibold text-amber-600">
                {formatCurrency(product.price)}
              </span>
              {product.comparePrice > product.price && (
                <span className="text-sm text-gray-400 line-through">
                  {formatCurrency(product.comparePrice)}
                </span>
              )}
            </>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
