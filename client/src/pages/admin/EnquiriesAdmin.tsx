import { useState, useEffect, useCallback } from 'react';
import { Helmet } from '@/lib/helmet';
import { MessageCircle, Trash2 } from 'lucide-react';
import { enquiriesAPI } from '@/lib/api';
import { getWhatsAppUrl } from '@/lib/utils';
import { useSiteSettings } from '@/context/SettingsContext';
import toast from 'react-hot-toast';

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const { settings } = useSiteSettings();

  const fetch = useCallback(async () => {
    try {
      const params: Record<string, string | number> = {};
      if (statusFilter) params.status = statusFilter;
      const res = await enquiriesAPI.getAll(params);
      setEnquiries(res.data.data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  const updateStatus = async (id: string, status: string) => {
    try { await enquiriesAPI.updateStatus(id, status); toast.success('Updated'); fetch(); }
    catch { toast.error('Failed'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this enquiry?')) return;
    try { await enquiriesAPI.delete(id); toast.success('Deleted'); fetch(); }
    catch { toast.error('Failed'); }
  };

  const handleWhatsApp = (enq: Record<string, unknown>) => {
    if (!settings?.whatsappNumber) return;
    let msg = `Hello ${enq.name}!\n`;
    msg += `Thank you for your enquiry. `;
    if (enq.message) msg += `Regarding: ${enq.message}`;
    window.open(getWhatsAppUrl(settings.whatsappNumber, msg), '_blank');
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <>
      <Helmet><title>Enquiries - Admin Panel</title></Helmet>
      <div className="space-y-4">
        <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Enquiries</h1>
        <div className="flex gap-2">
          {['', 'new', 'read', 'replied'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? 'bg-amber-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Message</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {enquiries.map(enq => (
                <tr key={String(enq._id)} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{String(enq.name)}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{String(enq.phone)}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{String(enq.email || '-')}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 truncate max-w-[200px]">{String(enq.message || '-')}</td>
                  <td className="px-4 py-3">
                    <select value={String(enq.status)} onChange={ev => updateStatus(String(enq._id), ev.target.value)} className={`text-xs px-2 py-1 rounded-full border-0 font-medium ${enq.status === 'new' ? 'bg-yellow-100 text-yellow-800' : enq.status === 'read' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                      <option value="new">New</option>
                      <option value="read">Read</option>
                      <option value="replied">Replied</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(String(enq.createdAt)).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleWhatsApp(enq)} className="p-1.5 rounded-lg hover:bg-gray-100 text-green-500"><MessageCircle className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(String(enq._id))} className="p-1.5 rounded-lg hover:bg-gray-100 text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!enquiries.length && <tr><td colSpan={7} className="text-center py-10 text-gray-400">No enquiries</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
