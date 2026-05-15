import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingBag, Moon, Sun, Search, Phone } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useSiteSettings } from '@/context/SettingsContext';
import { useCart } from '@/context/CartContext';
import { useDebounce } from '@/hooks/useDebounce';
import { productsAPI } from '@/lib/api';
import { cn, getImageUrl } from '@/lib/utils';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Record<string, unknown>[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { pathname } = useLocation();
  const { dark, toggle } = useTheme();
  const { settings } = useSiteSettings();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const debouncedSearch = useDebounce(searchQuery, 400);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    setSearchLoading(true);
    setShowDropdown(true);
    productsAPI.getAll({ search: debouncedSearch, limit: 5, visible: true })
      .then((res) => setSearchResults(res.data.data || []))
      .catch(() => {})
      .finally(() => setSearchLoading(false));
  }, [debouncedSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
      setShowDropdown(false);
    }
  };

  const handleSelectProduct = (slug: string) => {
    navigate(`/products/${slug}`);
    setSearchOpen(false);
    setSearchQuery('');
    setShowDropdown(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <button
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link to="/" className="flex items-center gap-3">
              {settings?.logo && (
                <img src={settings.logo} alt={settings.shopName} className="h-auto w-auto max-h-14" />
              )}
              <div>
                <span className="text-xl lg:text-2xl font-serif font-bold gradient-gold-text">
                  {settings?.shopName || 'Luxury Jewels'}
                </span>
                {settings?.liveRatesText && (
                  <span className="hidden sm:block text-[10px] lg:text-xs text-amber-600 dark:text-amber-400 font-medium leading-tight tracking-wide uppercase">
                    {settings.liveRatesText}
                  </span>
                )}
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    'text-sm font-medium transition-colors duration-200 relative py-1',
                    pathname === link.to
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400'
                  )}
                >
                  {link.label}
                  {pathname === link.to && (
                    <motion.div layoutId="nav-indicator" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />
                  )}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <button onClick={toggle} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <Link to="/cart" className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
              {settings?.phone && (
                <a href={`tel:${settings.phone}`} className="hidden md:flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-amber-600 ml-2">
                  <Phone className="w-4 h-4" />
                  {settings.phone}
                </a>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="border-t border-gray-200 dark:border-gray-800"
            >
              <div className="max-w-3xl mx-auto px-4 py-3" ref={searchRef}>
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (e.target.value.trim()) {
                        setShowDropdown(true);
                        setSearchLoading(true);
                      }
                    }}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl border-0 focus:ring-2 focus:ring-amber-500 outline-none dark:text-white dark:placeholder-gray-500"
                    autoFocus
                  />
                  {showDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                      {searchLoading ? (
                        <div className="flex items-center gap-2 p-4 text-sm text-gray-400 justify-center">
                          <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                          Searching...
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div>
                          {searchResults.slice(0, 5).map((product) => (
                            <button
                              key={String(product._id)}
                              type="button"
                              onClick={() => handleSelectProduct(String(product.slug))}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                            >
                              <img
                                src={getImageUrl((product.images as string[])?.[0])}
                                alt=""
                                className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {String(product.name)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {String(product.purity)} · ₹{Number(product.price).toLocaleString('en-IN')}
                                </p>
                              </div>
                            </button>
                          ))}
                          <div className="border-t border-gray-200 dark:border-gray-700">
                            <button
                              type="submit"
                              className="w-full px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 font-medium text-center transition-colors"
                            >
                              View all results →
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 text-center text-sm text-gray-400">No products found</div>
                      )}
                    </div>
                  )}
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
            <motion.nav
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="relative w-72 h-full bg-white dark:bg-gray-900 shadow-2xl p-6"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-lg font-serif font-bold gradient-gold-text">
                  {settings?.shopName || 'Menu'}
                </span>
                <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'block px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                      pathname === link.to
                        ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              {settings?.phone && (
                <a
                  href={`tel:${settings.phone}`}
                  className="flex items-center gap-2 mt-6 px-4 py-3 text-sm text-gray-600 dark:text-gray-400 hover:text-amber-600"
                >
                  <Phone className="w-4 h-4" />
                  {settings.phone}
                </a>
              )}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
