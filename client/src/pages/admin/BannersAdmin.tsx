import { useState, useEffect, useCallback } from 'react';
import { Helmet } from '@/lib/helmet';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { bannersAPI, uploadAPI } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

export default function AdminBanners() {
  const [banners, setBanners] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', subtitle: '', image: '', link: '', active: true, order: 0 });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetch = useCallback(async () => {
    try { const res = await bannersAPI.getAll(); setBanners(res.data.data.banners); }
    catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setEditingId(null); setForm({ title: '', subtitle: '', image: '', link: '', active: true, order: banners.length }); setModalOpen(true); };
  const openEdit = (b: Record<string, unknown>) => { setEditingId(String(b._id)); setForm({ title: String(b.title || ''), subtitle: String(b.subtitle || ''), image: String(b.image || ''), link: String(b.link || ''), active: Boolean(b.active), order: Number(b.order || 0) }); setModalOpen(true); };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadAPI.uploadSingle(file);
      setForm(prev => ({ ...prev, image: res.data.data.url }));
      toast.success('Image uploaded');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image) { toast.error('Image URL required'); return; }
    setSaving(true);
    try {
      if (editingId) { await bannersAPI.update(editingId, form); toast.success('Updated'); }
      else { await bannersAPI.create(form); toast.success('Created'); }
      setModalOpen(false); fetch();
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    try { await bannersAPI.delete(id); toast.success('Deleted'); fetch(); }
    catch { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <>
      <Helmet><title>Banners - Admin Panel</title></Helmet>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Banners</h1>
          <Button onClick={openCreate}><Plus className="w-4 h-4 mr-1" /> Add Banner</Button>
        </div>
        <div className="grid gap-4">
          {banners.map((b) => (
            <div key={String(b._id)} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex">
                <div className="w-48 shrink-0 bg-gray-100">
                  <img src={getImageUrl(String(b.image))} alt="" className="w-full h-28 object-cover" />
                </div>
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{String(b.title || 'Untitled')}</h3>
                      <p className="text-sm text-gray-500">{String(b.subtitle || '')}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${b.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {b.active ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-xs text-gray-400">Order: {String(b.order || 0)}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-500"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(String(b._id))} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {!banners.length && <p className="text-center text-gray-400 py-10">No banners yet</p>}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Banner' : 'Add Banner'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input id="b-title" label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <Input id="b-subtitle" label="Subtitle" value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image *</label>
            <div className="flex items-center gap-2">
              <input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://..." required className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 outline-none transition-colors" />
              <label className="shrink-0 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 text-sm text-gray-600 dark:text-gray-300">
                {uploading ? '...' : 'Upload'}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
          </div>
          <Input id="b-link" label="Link (e.g., /products?category=gold)" value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} />
          <Input id="b-order" label="Display Order" type="number" value={form.order} onChange={e => setForm({ ...form, order: Number(e.target.value) })} />
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
