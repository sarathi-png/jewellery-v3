import { useState, useEffect, useCallback } from 'react';
import { Helmet } from '@/lib/helmet';
import { Plus, Pencil, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';
import { categoriesAPI } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

interface Category {
  _id: string; name: string; nameTamil: string; slug: string; image: string;
  description: string; order: number; visible: boolean; productCount: number;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', nameTamil: '', slug: '', image: '', description: '', order: 0, visible: true });
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    try {
      const res = await categoriesAPI.getAll({ all: true });
      setCategories(res.data.data.categories.sort((a: Category, b: Category) => a.order - b.order));
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setEditingId(null); setForm({ name: '', nameTamil: '', slug: '', image: '', description: '', order: categories.length, visible: true }); setModalOpen(true); };

  const openEdit = (cat: Category) => { setEditingId(cat._id); setForm({ name: cat.name, nameTamil: cat.nameTamil, slug: cat.slug, image: cat.image, description: cat.description, order: cat.order, visible: cat.visible }); setModalOpen(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { toast.error('Name required'); return; }
    setSaving(true);
    try {
      const data = { ...form, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-') };
      if (editingId) { await categoriesAPI.update(editingId, data); toast.success('Category updated'); }
      else { await categoriesAPI.create(data); toast.success('Category created'); }
      setModalOpen(false);
      fetch();
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try { await categoriesAPI.delete(id); toast.success('Deleted'); fetch(); }
    catch { toast.error('Cannot delete: category has products'); }
  };

  const toggleVisibility = async (cat: Category) => {
    try { await categoriesAPI.update(cat._id, { visible: !cat.visible }); fetch(); }
    catch { toast.error('Failed to update'); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <>
      <Helmet><title>Categories - Admin Panel</title></Helmet>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Categories</h1>
          <Button onClick={openCreate}><Plus className="w-4 h-4 mr-1" /> Add Category</Button>
        </div>

        <div className="grid gap-4">
          {categories.map(cat => (
            <div key={cat._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                <img src={getImageUrl(cat.image)} alt={cat.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{cat.name}</h3>
                  {cat.nameTamil && <span className="text-sm text-gray-500">({cat.nameTamil})</span>}
                </div>
                <p className="text-sm text-gray-500">{cat.productCount} products · Order: {cat.order}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleVisibility(cat)} className={`p-2 rounded-lg transition-colors ${cat.visible ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`} title={cat.visible ? 'Visible' : 'Hidden'}>
                  {cat.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button onClick={() => openEdit(cat)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-500"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(cat._id)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input id="cat-name" label="Category Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <Input id="cat-name-ta" label="Name (Tamil)" value={form.nameTamil} onChange={e => setForm({ ...form, nameTamil: e.target.value })} />
          </div>
          <Input id="cat-slug" label="Slug" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="Auto-generated if empty" />
          <Input id="cat-image" label="Image URL" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 outline-none transition-colors" />
          </div>
          <Input id="cat-order" label="Display Order" type="number" value={form.order} onChange={e => setForm({ ...form, order: Number(e.target.value) })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.visible} onChange={e => setForm({ ...form, visible: e.target.checked })} className="rounded border-gray-300 text-amber-500 focus:ring-amber-500" />
            Visible on website
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
