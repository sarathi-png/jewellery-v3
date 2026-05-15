import { Helmet } from '@/lib/helmet';
import ProductFilters from '@/components/products/ProductFilters';
import { useSiteSettings } from '@/context/SettingsContext';

export default function Products() {
  const { settings } = useSiteSettings();
  return (
    <>
      <Helmet>
        <title>{`Products - ${settings?.shopName || 'Luxury Jewels'}`}</title>
        <meta name="description" content="Browse our complete collection of gold, diamond, silver, and platinum jewellery." />
      </Helmet>
      <div className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl lg:text-4xl font-serif font-bold text-gray-900 dark:text-white">
            Our Collection
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Discover timeless elegance crafted to perfection
          </p>
        </div>
      </div>
      <ProductFilters />
    </>
  );
}
