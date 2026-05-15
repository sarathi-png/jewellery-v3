import { useState, useEffect, useCallback } from 'react';
import { Helmet } from '@/lib/helmet';
import { Plus, Pencil, Trash2, Eye, EyeOff, Search } from 'lucide-react';
import { productsAPI, categoriesAPI, uploadAPI } from '@/lib/api';
import { formatCurrency, getImageUrl } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

interface Product {
  _id: string; name: string; slug: string; description: string; category: { _id: string; name: string };
  images: string[]; weight: number; purity: string; price: number; comparePrice: number;
  stock: number; sku: string; featured: boolean; trending: boolean; newArrival: boolean; visible: boolean;
}

interface Category { _id: string; name: string }

const emptyForm = {
  name: '', slug: '', description: '', category: '', images: [] as string[],
  weight: 0, purity: '22K', price: 0, comparePrice: 0, stock: 0, sku: '',
  featured: false, trending: false, newArrival: false, visible: true,
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        productsAPI.getAll({ visible: undefined }),
        categoriesAPI.getAll({ all: true }),
      ]);
      setProducts(prodRes.data.data);
      setCategories(catRes.data.data.categories);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (id: string) => {
    const prod = products.find(p => p._id === id);
    if (!prod) { toast.error('Product not found'); return; }
    setEditingId(id);
    setForm({
      name: prod.name, slug: prod.slug, description: prod.description,
      category: typeof prod.category === 'object' ? prod.category._id : prod.category,
      images: prod.images, weight: prod.weight, purity: prod.purity,
      price: prod.price, comparePrice: prod.comparePrice, stock: prod.stock,
      sku: prod.sku, featured: prod.featured, trending: prod.trending,
      newArrival: prod.newArrival, visible: prod.visible,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.category) { toast.error('Name and category required'); return; }
    setSaving(true);
    try {
      const data = { ...form, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now() };
      if (editingId) {
        await productsAPI.update(editingId, data);
        toast.success('Product updated');
      } else {
        await productsAPI.create(data);
        toast.success('Product created');
      }
      setModalOpen(false);
      fetchData();
    } catch { toast.error('Failed to save product'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await productsAPI.delete(id);
      toast.success('Product deleted');
      fetchData();
    } catch { toast.error('Failed to delete'); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(f => formData.append('images', f));
      const res = await uploadAPI.uploadMultiple(Array.from(files));
      setForm(prev => ({ ...prev, images: [...prev.images, ...res.data.data.urls] }));
      toast.success('Images uploaded');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Spinner className="py-20" />;

  return (
    <>
      <Helmet><title>Products - Admin Panel</title></Helmet>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Products</h1>
          <Button onClick={openCreate}><Plus className="w-4 h-4 mr-1" /> Add Product</Button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl border-0 focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Product</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Category</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Weight</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Price</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Stock</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filtered.map(p => (
                <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={getImageUrl(p.images?.[0])} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                      <span className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{typeof p.category === 'object' ? p.category?.name : '-'}</td>
                  <td className="px-4 py-3">{p.weight}g</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(p.price)}</td>
                  <td className="px-4 py-3">
                    <span className={`${p.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3">{p.visible ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-gray-400" />}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(p._id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-500"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p._id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400">No products found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Product' : 'Add Product'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input id="name" label="Product Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <Input id="sku" label="SKU" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 outline-none transition-colors" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select id="category" label="Category *" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} options={categories.map(c => ({ value: c._id, label: c.name }))} placeholder="Select category" />
            <Select id="purity" label="Purity" value={form.purity} onChange={e => setForm({ ...form, purity: e.target.value })} options={['22K', '24K', '18K', 'PT950', 'Silver 925'].map(v => ({ value: v, label: v }))} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input id="weight" label="Weight (g)" type="number" value={form.weight} onChange={e => setForm({ ...form, weight: Number(e.target.value) })} />
            <Input id="price" label="Price" type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
            <Input id="comparePrice" label="Compare Price" type="number" value={form.comparePrice} onChange={e => setForm({ ...form, comparePrice: Number(e.target.value) })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input id="stock" label="Stock" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: Number(e.target.value) })} />
            <Input id="slug" label="Slug" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="Auto-generated if empty" />
          </div>

          <div className="flex flex-wrap gap-4">
            {(['featured', 'trending', 'newArrival', 'visible'] as const).map(f => (
              <label key={f} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form[f]} onChange={e => setForm({ ...form, [f]: e.target.checked })} className="rounded border-gray-300 text-amber-500 focus:ring-amber-500" />
                {f === 'newArrival' ? 'New Arrival' : f.charAt(0).toUpperCase() + f.slice(1)}
              </label>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Images</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.images.map((url, i) => (
                <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                  <img src={getImageUrl(url)} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })} className="absolute top-0 right-0 bg-red-500 text-white text-xs w-4 h-4 rounded-bl">
                    ×
                  </button>
                </div>
              ))}
            </div>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-200 text-sm">
              {uploading ? 'Uploading...' : 'Upload Images'}
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
            </label>
            <p className="text-xs text-gray-400 mt-1">Or paste image URLs directly:</p>
            <input
              type="text"
              placeholder="Paste image URL and press Enter"
              className="w-full mt-1 px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 outline-none"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const input = e.target as HTMLInputElement;
                  if (input.value.trim()) {
                    setForm({ ...form, images: [...form.images, input.value.trim()] });
                    input.value = '';
                  }
                }
              }}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editingId ? 'Update' : 'Create'} Product</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
