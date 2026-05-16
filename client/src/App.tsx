import { Routes, Route } from 'react-router-dom';
import { Helmet } from '@/lib/helmet';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/shared/WhatsAppButton';
import ScrollToTop from '@/components/shared/ScrollToTop';
import AdminLayout from '@/components/layout/AdminLayout';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import Home from '@/pages/Home';
import Products from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Cart from '@/pages/Cart';
import AdminLogin from '@/pages/admin/Login';
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminProducts from '@/pages/admin/ProductsAdmin';
import AdminCategories from '@/pages/admin/CategoriesAdmin';
import AdminBanners from '@/pages/admin/BannersAdmin';
import AdminOffers from '@/pages/admin/OffersAdmin';
import AdminTestimonials from '@/pages/admin/TestimonialsAdmin';
import AdminOrders from '@/pages/admin/OrdersAdmin';
import AdminEnquiries from '@/pages/admin/EnquiriesAdmin';
import AdminSettings from '@/pages/admin/SettingsAdmin';
import AdminStockAnalytics from '@/pages/admin/StockAnalytics';

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
    </>
  );
}

export default function App() {
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Abirami Jewellery</title>
      </Helmet>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="banners" element={<AdminBanners />} />
          <Route path="offers" element={<AdminOffers />} />
          <Route path="testimonials" element={<AdminTestimonials />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="enquiries" element={<AdminEnquiries />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="stock" element={<AdminStockAnalytics />} />
        </Route>
        <Route path="*" element={
          <PublicLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:slug" element={<ProductDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/cart" element={<Cart />} />
            </Routes>
          </PublicLayout>
        } />
      </Routes>
    </>
  );
}
