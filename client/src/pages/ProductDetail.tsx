import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from '@/lib/helmet';
import { motion } from 'framer-motion';
import { ShoppingBag, MessageCircle, ChevronRight, Shield, Award, Truck, BadgeCheck } from 'lucide-react';
import { productsAPI } from '@/lib/api';
import { formatCurrency, getImageUrl, getWhatsAppUrl } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useSiteSettings } from '@/context/SettingsContext';
import ImageGallery from '@/components/products/ImageGallery';
import ProductCard from '@/components/products/ProductCard';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { useProducts } from '@/hooks/useProducts';
import toast from 'react-hot-toast';
import type { AxiosResponse } from 'axios';

interface Product {
  _id: string;
  name: string;
  description: string;
  slug: string;
  images: string[];
  weight: number;
  purity: string;
  price: number;
  comparePrice: number;
  stock: number;
  sku: string;
  featured: boolean;
  trending: boolean;
  newArrival: boolean;
  specifications: { label: string; value: string }[];
  category: { _id: string; name: string; slug: string };
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { settings } = useSiteSettings();
  const { products: similar } = useProducts(
    product ? { category: product.category?._id, visible: true, limit: 4 } : { visible: true, limit: 4 }
  );

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    productsAPI.getBySlug(slug)
      .then((res: AxiosResponse) => setProduct(res.data.data.product))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) return <Spinner className="py-32" />;
  if (!product) return (
    <div className="text-center py-32">
      <p className="text-gray-500 text-lg">Product not found</p>
      <Link to="/products" className="mt-4 inline-block text-amber-600 hover:text-amber-700 font-medium">Back to products</Link>
    </div>
  );

  const discount = product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0;

  const handleAddToCart = () => {
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

  const whatsappMsg = `Hello! I'm interested in ${product.name} (${product.purity}, ${product.weight}g, SKU: ${product.sku}). Price: ₹${product.price.toLocaleString()}. Please share more details.`;

  const filteredSimilar = similar.filter((p) => p._id !== product._id).slice(0, 4);

  return (
    <>
      <Helmet>
        <title>{`${product.name} - ${settings?.shopName || 'Luxury Jewels'}`}</title>
        <meta name="description" content={product.description.substring(0, 160)} />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-amber-600">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/products" className="hover:text-amber-600">Products</Link>
          {product.category && (
            <>
              <ChevronRight className="w-3 h-3" />
              <Link to={`/products?category=${product.category.slug}`} className="hover:text-amber-600">
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-900 dark:text-white truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <ImageGallery images={product.images} productName={product.name} />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex flex-wrap gap-2 mb-3">
              {product.newArrival && <Badge variant="gold">New Arrival</Badge>}
              {product.trending && <Badge variant="warning">Trending</Badge>}
              {discount > 0 && <Badge variant="danger">-{discount}% Off</Badge>}
            </div>

            <h1 className="text-2xl lg:text-3xl font-serif font-bold text-gray-900 dark:text-white mb-2">
              {product.name}
            </h1>

            {product.sku && (
              <p className="text-sm text-gray-500 mb-4">SKU: {product.sku}</p>
            )}

            {settings?.showPrice !== false && (
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl lg:text-3xl font-bold text-amber-600">
                  {formatCurrency(product.price)}
                </span>
                {product.comparePrice > product.price && (
                  <>
                    <span className="text-lg text-gray-400 line-through">
                      {formatCurrency(product.comparePrice)}
                    </span>
                    <span className="text-sm font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                      Save {formatCurrency(product.comparePrice - product.price)}
                    </span>
                  </>
                )}
              </div>
            )}

            <div className="flex items-center gap-4 mb-6 text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Purity: <strong className="text-gray-900 dark:text-white">{product.purity}</strong>
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-600 dark:text-gray-400">
                Weight: <strong className="text-gray-900 dark:text-white">{product.weight}g</strong>
              </span>
              <span className="text-gray-300">|</span>
              <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            {product.description && (
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                {product.description}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button onClick={handleAddToCart} disabled={product.stock === 0} className="flex-1">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(getWhatsAppUrl(settings?.whatsappNumber || '', whatsappMsg), '_blank')}
                className="flex-1"
              >
                <MessageCircle className="w-4 h-4 mr-2 text-green-500" />
                Enquire on WhatsApp
              </Button>
            </div>

            {product.specifications?.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">
                  Specifications
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {product.specifications.map((spec, i) => (
                    <div key={i} className="text-sm">
                      <span className="text-gray-500">{spec.label}: </span>
                      <span className="text-gray-900 dark:text-white font-medium">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Shield, text: 'BIS Hallmarked' },
                { icon: Award, text: 'Certified' },
                { icon: Truck, text: 'Free Shipping' },
                { icon: BadgeCheck, text: 'Easy Returns' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                  <item.icon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  {item.text}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {filteredSimilar.length > 0 && (
          <div className="mt-16 lg:mt-20 border-t border-gray-200 dark:border-gray-700 pt-10">
            <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-6">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredSimilar.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
