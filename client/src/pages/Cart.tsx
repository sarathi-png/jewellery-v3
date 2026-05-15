import { Helmet } from '@/lib/helmet';
import { motion } from 'framer-motion';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useSiteSettings } from '@/context/SettingsContext';
import { ordersAPI } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Cart() {
  const { items, updateQuantity, removeItem, totalAmount, clearCart } = useCart();
  const { settings } = useSiteSettings();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', address: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast.error('Name and phone are required');
      return;
    }
    if (!items.length) {
      toast.error('Cart is empty');
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        customerName: form.name,
        phone: form.phone,
        address: form.address,
        notes: form.notes,
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
        totalAmount,
      };

      await ordersAPI.create(orderData);

      clearCart();
      toast.success('Order placed! We will contact you shortly.');
      navigate('/');
    } catch {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!items.length) {
    return (
      <>
        <Helmet><title>Shopping Cart - {settings?.shopName || 'Luxury Jewels'}</title></Helmet>
        <div className="text-center py-32">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-2">Your Cart is Empty</h2>
          <p className="text-gray-500 mb-6">Add some jewellery to get started</p>
          <Link to="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors font-medium">
            Browse Products
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet><title>Shopping Cart - {settings?.shopName || 'Luxury Jewels'}</title></Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-8">Shopping Cart</h1>

        <div className="space-y-4 mb-8">
          {items.map((item) => (
            <motion.div
              key={item.productId}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
            >
              <Link to={`/products/${item.slug}`} className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                <img src={item.image || '/placeholder.svg'} alt={item.name} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.slug}`} className="font-medium text-gray-900 dark:text-white hover:text-amber-600 truncate block">
                  {item.name}
                </Link>
                <p className="text-sm text-gray-500">{item.purity} · {item.weight}g</p>
                <p className="text-sm font-semibold text-amber-600 mt-0.5">{formatCurrency(item.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="w-24 text-right font-semibold text-gray-900 dark:text-white">
                {formatCurrency(item.price * item.quantity)}
              </p>
              <button onClick={() => removeItem(item.productId)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-8 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
          <span className="text-2xl font-bold text-amber-600">{formatCurrency(totalAmount)}</span>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 lg:p-8">
          <h2 className="text-xl font-serif font-semibold text-gray-900 dark:text-white mb-6">Customer Details</h2>
          <form onSubmit={handlePlaceOrder} className="space-y-4">
            <Input id="name" label="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter your full name" required />
            <Input id="phone" label="Phone Number *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Enter your phone number" required />
            <Input id="address" label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Enter delivery address" />
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order Notes</label>
              <textarea id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any special instructions..." rows={3} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-colors" />
            </div>
            <Button type="submit" loading={submitting} className="w-full py-3 text-base">
              Place Order
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
