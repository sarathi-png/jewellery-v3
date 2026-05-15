import { useState, useEffect } from 'react';
import { Helmet } from '@/lib/helmet';
import { Package, Grid3X3, ShoppingCart, MessageSquare, TrendingUp, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { productsAPI, categoriesAPI, ordersAPI, enquiriesAPI } from '@/lib/api';
import type { AxiosResponse } from 'axios';

interface Stat { label: string; value: number; icon: typeof Package; color: string }

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [recentOrders, setRecentOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [prodRes, catRes, orderRes, enqRes] = await Promise.all([
          productsAPI.getAll({ limit: 1 }),
          categoriesAPI.getAll({ all: true }),
          ordersAPI.getAll({ limit: 5 }),
          enquiriesAPI.getAll({ limit: 5 }),
        ]);

        setStats([
          { label: 'Total Products', value: prodRes.data.pagination?.total || 0, icon: Package, color: 'bg-blue-500' },
          { label: 'Categories', value: catRes.data.data.categories?.length || 0, icon: Grid3X3, color: 'bg-amber-500' },
          { label: 'Orders', value: orderRes.data.pagination?.total || 0, icon: ShoppingCart, color: 'bg-green-500' },
          { label: 'Enquiries', value: enqRes.data.pagination?.total || 0, icon: MessageSquare, color: 'bg-purple-500' },
        ]);
        setRecentOrders(orderRes.data.data || []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <>
      <Helmet><title>Dashboard - Admin Panel</title></Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500">Overview of your jewellery shop</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" /> Recent Orders
            </h2>
            {recentOrders.length ? (
              <div className="space-y-3">
                {recentOrders.slice(0, 5).map((order: Record<string, unknown>) => (
                  <div key={String(order._id)} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{String(order.customerName)}</p>
                      <p className="text-gray-500 text-xs">{String(order.phone)}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>{String(order.status)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">No orders yet</p>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Add Product', href: '/admin/products', icon: Package },
                { label: 'Manage Categories', href: '/admin/categories', icon: Grid3X3 },
                { label: 'View Orders', href: '/admin/orders', icon: ShoppingCart },
                { label: 'Site Settings', href: '/admin/settings', icon: TrendingUp },
              ].map((action) => (
                <a
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-amber-600 transition-colors"
                >
                  <action.icon className="w-4 h-4" />
                  {action.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
