import { useState, useEffect, useCallback } from 'react';
import { Helmet } from '@/lib/helmet';
import { MessageCircle, Search, Download } from 'lucide-react';
import { ordersAPI } from '@/lib/api';
import { formatCurrency, getWhatsAppUrl } from '@/lib/utils';
import { useSiteSettings } from '@/context/SettingsContext';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const { settings } = useSiteSettings();

  const fetch = useCallback(async () => {
    try {
      const params: Record<string, string | number> = {};
      if (statusFilter) params.status = statusFilter;
      const res = await ordersAPI.getAll(params);
      setOrders(res.data.data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  const updateStatus = async (id: string, status: string) => {
    try { await ordersAPI.updateStatus(id, status); toast.success('Status updated'); fetch(); }
    catch { toast.error('Failed to update'); }
  };

  const handleWhatsApp = (order: Record<string, unknown>) => {
    if (!settings?.whatsappNumber) return;
    let msg = `Hello! This is regarding your order.\n`;
    msg += `Customer: ${order.customerName}\n`;
    msg += `Phone: ${order.phone}\n`;
    msg += `Status: ${order.status}\n`;
    msg += `Total: ₹${Number(order.totalAmount).toLocaleString()}\n`;
    if (order.address) msg += `Address: ${order.address}\n`;
    window.open(getWhatsAppUrl(settings.whatsappNumber, msg), '_blank');
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800', confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800', delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <>
      <Helmet><title>Orders - Admin Panel</title></Helmet>
      <div className="space-y-4">
        <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Orders</h1>

        <div className="flex items-center gap-2 flex-wrap">
          {['', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? 'bg-amber-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'}`}>
              {s || 'All'}
            </button>
          ))}
          <div className="ml-auto">
            <button
              onClick={async () => {
                try {
                  const res = await ordersAPI.exportExcel(statusFilter || undefined);
                  const url = window.URL.createObjectURL(new Blob([res.data]));
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `orders-${statusFilter || 'all'}-${Date.now()}.xlsx`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  window.URL.revokeObjectURL(url);
                  toast.success('Orders exported');
                } catch { toast.error('Export failed'); }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Items</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Total</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {orders.map(o => (
                <tr key={String(o._id)} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 dark:text-white">{String(o.customerName)}</p>
                    {o.address && <p className="text-xs text-gray-400 truncate max-w-[150px]">{String(o.address)}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{String(o.phone)}</td>
                  <td className="px-4 py-3">
                    <span className="text-gray-900 dark:text-white font-medium">{(o.items as Array<Record<string, unknown>>)?.length || 0}</span>
                    <span className="text-gray-400"> items</span>
                  </td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(Number(o.totalAmount))}</td>
                  <td className="px-4 py-3">
                    <select value={String(o.status)} onChange={e => updateStatus(String(o._id), e.target.value)} className={`text-xs px-2 py-1 rounded-full border-0 font-medium ${statusColors[String(o.status)] || ''}`}>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(String(o.createdAt)).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleWhatsApp(o)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-green-500">
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {!orders.length && <tr><td colSpan={7} className="text-center py-10 text-gray-400">No orders found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
