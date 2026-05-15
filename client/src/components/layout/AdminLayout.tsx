import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, Package, Grid3X3, Image, Percent, Star, ShoppingCart, MessageSquare, Settings, BarChart3, LogOut, Gem, ChevronRight
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/categories', icon: Grid3X3, label: 'Categories' },
  { to: '/admin/banners', icon: Image, label: 'Banners' },
  { to: '/admin/offers', icon: Percent, label: 'Offers' },
  { to: '/admin/testimonials', icon: Star, label: 'Testimonials' },
  { to: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/admin/enquiries', icon: MessageSquare, label: 'Enquiries' },
  { to: '/admin/stock', icon: BarChart3, label: 'Stock' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex transition-colors duration-300">
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center gap-2 px-6 h-16 border-b border-gray-200 dark:border-gray-800">
          <Gem className="w-5 h-5 text-amber-500" />
          <span className="font-serif font-bold gradient-gold-text">Admin Panel</span>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const active = item.end ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  active
                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <p className="font-medium text-gray-900 dark:text-white truncate">{admin?.name}</p>
              <p className="text-gray-500 text-xs">{admin?.email}</p>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-red-500 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 h-16 flex items-center px-4 lg:px-6 transition-colors duration-300">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="flex items-center gap-2 ml-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-amber-600">Website</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-900 dark:text-white capitalize">
              {pathname === '/admin' ? 'Dashboard' : pathname.split('/').pop()}
            </span>
          </div>
          <Link to="/" className="ml-auto text-xs text-amber-600 hover:text-amber-700 font-medium">
            View Store
          </Link>
        </header>
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
