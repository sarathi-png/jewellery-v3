import { useState, useEffect, useCallback } from 'react';
import { Helmet } from '@/lib/helmet';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { offersAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

export default function AdminOffers() {
  const [offers, setOffers] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', image: '', link: '', active: true });
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => { try { const res = await offersAPI.getAll(); setOffers(res.data.data.offers); } catch {} finally { setLoading(false); } }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setEditingId(null); setForm({ title: '', description: '', image: '', link: '', active: true }); setModalOpen(true); };
  const openEdit = (o: Record<string, unknown>) => { setEditingId(String(o._id)); setForm({ title: String(o.title), description: String(o.description || ''), image: String(o.image || ''), link: String(o.link || ''), active: Boolean(o.active) }); setModalOpen(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) { toast.error('Title required'); return; }
    setSaving(true);
    try { if (editingId) { await offersAPI.update(editingId, form); toast.success('Updated'); } else { await offersAPI.create(form); toast.success('Created'); } setModalOpen(false); fetch(); }
    catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => { if (!confirm('Delete?')) return; try { await offersAPI.delete(id); toast.success('Deleted'); fetch(); } catch { toast.error('Failed'); } };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <>
      <Helmet><title>Offers - Admin Panel</title></Helmet>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Offers</h1>
          <Button onClick={openCreate}><Plus className="w-4 h-4 mr-1" /> Add Offer</Button>
        </div>
        <div className="grid gap-4">
          {offers.map(o => (
            <div key={String(o._id)} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{String(o.title)}</h3>
                <p className="text-sm text-gray-500">{String(o.description || '')}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${o.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{o.active ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(o)} className="p-1.5 rounded-lg hover:bg-gray-100 text-blue-500"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(String(o._id))} className="p-1.5 rounded-lg hover:bg-gray-100 text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {!offers.length && <p className="text-center text-gray-400 py-10">No offers yet</p>}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Offer' : 'Add Offer'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input id="o-title" label="Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 outline-none transition-colors" />
          </div>
          <Input id="o-image" label="Image URL" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} />
          <Input id="o-link" label="Link" value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} className="rounded border-gray-300 text-amber-500 focus:ring-amber-500" />
            Active
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editingId ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
