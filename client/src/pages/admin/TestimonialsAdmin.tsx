import { useState, useEffect, useCallback } from 'react';
import { Helmet } from '@/lib/helmet';
import { Plus, Pencil, Trash2, Star, CheckCircle, XCircle } from 'lucide-react';
import { testimonialsAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ customerName: '', location: '', rating: 5, avatar: '', review: '' });
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => { try { const res = await testimonialsAPI.getAllAdmin(); setTestimonials(res.data.data.testimonials); } catch {} finally { setLoading(false); } }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setEditingId(null); setForm({ customerName: '', location: '', rating: 5, avatar: '', review: '' }); setModalOpen(true); };
  const openEdit = (t: Record<string, unknown>) => { setEditingId(String(t._id)); setForm({ customerName: String(t.customerName), location: String(t.location || ''), rating: Number(t.rating), avatar: String(t.avatar || ''), review: String(t.review) }); setModalOpen(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName || !form.review) { toast.error('Name and review required'); return; }
    setSaving(true);
    try { if (editingId) { await testimonialsAPI.update(editingId, form); toast.success('Updated'); } else { await testimonialsAPI.create(form); toast.success('Created'); } setModalOpen(false); fetch(); }
    catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => { if (!confirm('Delete?')) return; try { await testimonialsAPI.delete(id); toast.success('Deleted'); fetch(); } catch { toast.error('Failed'); } };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <>
      <Helmet><title>Testimonials - Admin Panel</title></Helmet>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Testimonials</h1>
          <Button onClick={openCreate}><Plus className="w-4 h-4 mr-1" /> Add Testimonial</Button>
        </div>
        <div className="grid gap-4">
          {testimonials.map(t => (
            <div key={String(t._id)} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-semibold">{String(t.customerName).charAt(0)}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{String(t.customerName)}</h3>
                          {t.verified ? (
                            <span className="inline-flex items-center gap-0.5 text-xs text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full font-medium"><CheckCircle className="w-3 h-3" /> Verified</span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 text-xs text-yellow-600 bg-yellow-100 px-1.5 py-0.5 rounded-full font-medium"><XCircle className="w-3 h-3" /> Pending</span>
                          )}
                        </div>
                        {t.location && <p className="text-xs text-gray-500">{String(t.location)}</p>}
                      </div>
                    </div>
                    <div className="flex gap-0.5 mt-2">
                      {Array.from({ length: 5 }).map((_, i) => (<Star key={i} className={`w-3.5 h-3.5 ${i < Number(t.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />))}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">&ldquo;{String(t.review)}&rdquo;</p>
                  </div>
                  <div className="flex gap-1">
                    {!t.verified && (
                      <button onClick={async () => { try { await testimonialsAPI.update(String(t._id), { verified: true }); toast.success('Verified'); fetch(); } catch { toast.error('Failed'); } }} className="p-1.5 rounded-lg hover:bg-gray-100 text-green-500" title="Approve"><CheckCircle className="w-4 h-4" /></button>
                    )}
                    <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg hover:bg-gray-100 text-blue-500"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(String(t._id))} className="p-1.5 rounded-lg hover:bg-gray-100 text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
            </div>
          ))}
          {!testimonials.length && <p className="text-center text-gray-400 py-10">No testimonials yet</p>}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Testimonial' : 'Add Testimonial'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input id="t-name" label="Customer Name *" value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} required />
          <Input id="t-location" label="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(r => (
                <button key={r} type="button" onClick={() => setForm({ ...form, rating: r })}>
                  <Star className={`w-6 h-6 ${r <= form.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
          </div>
          <Input id="t-avatar" label="Avatar URL" value={form.avatar} onChange={e => setForm({ ...form, avatar: e.target.value })} placeholder="https://..." />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Review *</label>
            <textarea value={form.review} onChange={e => setForm({ ...form, review: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 outline-none transition-colors" required />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editingId ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
