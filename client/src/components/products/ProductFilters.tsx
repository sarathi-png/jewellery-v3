import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useDebounce } from '@/hooks/useDebounce';
import ProductCard from '@/components/products/ProductCard';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';

export default function ProductFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(search, 400);

  const category = searchParams.get('category') || '';
  const purity = searchParams.get('purity') || '';
  const sort = searchParams.get('sort') || 'newest';

  const { categories } = useCategories();

  const params: Record<string, string | number | boolean> = { visible: true };
  if (debouncedSearch) params.search = debouncedSearch;
  if (category) params.category = category;
  if (purity) params.purity = purity;

  const { products, loading, pagination } = useProducts(params);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
    setSearch('');
  };

  const hasFilters = category || purity || debouncedSearch;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 shrink-0">
          <div className="hidden lg:block space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">Categories</h3>
              <div className="space-y-1">
                <button
                  onClick={() => updateParam('category', '')}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!category ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                  All Categories
                </button>
                {categories.filter(c => c.visible).map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => updateParam('category', cat.slug)}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${category === cat.slug ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">Purity</h3>
              <div className="space-y-1">
                {[
                  { value: '', label: 'All' },
                  { value: '24K', label: '24K Gold' },
                  { value: '22K', label: '22K Gold' },
                  { value: '18K', label: '18K Gold' },
                  { value: 'PT950', label: 'Platinum 950' },
                  { value: 'Silver 925', label: 'Silver 925' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateParam('purity', opt.value)}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${purity === opt.value ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:hidden">
            <Button variant="outline" onClick={() => setShowFilters(true)} className="w-full">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters {hasFilters && `(${[category, purity, debouncedSearch].filter(Boolean).length})`}
            </Button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/50 lg:hidden"
                onClick={() => setShowFilters(false)}
              >
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-900 p-6 shadow-2xl overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold">Filters</h3>
                    <button onClick={() => setShowFilters(false)}><X className="w-5 h-5" /></button>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Category</h4>
                      {/* Same category buttons as desktop */}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl border-0 focus:ring-2 focus:ring-amber-500 outline-none text-sm dark:text-white dark:placeholder-gray-500"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl border-0 text-sm focus:ring-2 focus:ring-amber-500 outline-none dark:text-white"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A-Z</option>
            </select>
            {hasFilters && (
              <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-red-500 px-2 transition-colors">
                Clear
              </button>
            )}
          </div>

          {loading ? (
            <Spinner className="py-20" />
          ) : !products.length ? (
            <div className="text-center py-20">
              <p className="text-gray-500 dark:text-gray-400 text-lg">No products found</p>
              {hasFilters && (
                <button onClick={clearFilters} className="mt-2 text-amber-600 hover:text-amber-700 text-sm font-medium">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {products.map((product, i) => (
                  <ProductCard key={product._id} product={product} index={i} />
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: pagination.totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => updateParam('page', String(i + 1))}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                        pagination.page === i + 1
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
