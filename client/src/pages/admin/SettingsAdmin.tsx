import { useState, useEffect, useCallback } from 'react';
import { Helmet } from '@/lib/helmet';
import { useSiteSettings } from '@/context/SettingsContext';
import { useCategories } from '@/hooks/useCategories';
import { settingsAPI, uploadAPI, whatsappBotAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const { settings, refetch } = useSiteSettings();
  const { categories } = useCategories();
  const [tab, setTab] = useState<'general' | 'branding' | 'contact' | 'sections' | 'bot'>('general');
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (settings) setForm({ ...settings });
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsAPI.update(form);
      toast.success('Settings saved');
      refetch();
    } catch { toast.error('Failed to save settings'); }
    finally { setSaving(false); }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadAPI.uploadSingle(file);
      setForm((prev: Record<string, unknown>) => ({ ...prev, logo: res.data.data.url }));
      toast.success('Logo uploaded');
    } catch (err) {
      console.error('[Logo Upload]', err);
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Upload failed';
      toast.error(msg);
    }
    finally { setUploading(false); }
  };

  const handleAboutImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadAPI.uploadSingle(file);
      setForm((prev: Record<string, unknown>) => ({ ...prev, aboutImage: res.data.data.url }));
      toast.success('About banner uploaded');
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Upload failed';
      toast.error(msg);
    } finally { setUploading(false); }
  };

  const [botStatus, setBotStatus] = useState<string>('disconnected');
  const [botQr, setBotQr] = useState<string | null>(null);
  const [botLastError, setBotLastError] = useState<string | null>(null);
  const [botRetryCount, setBotRetryCount] = useState<number>(0);
  const [polling, setPolling] = useState(false);

  const fetchBotStatus = useCallback(async () => {
    try {
      const res = await whatsappBotAPI.getStatus();
      const d = res.data.data;
      setBotStatus(d.status);
      setBotQr(d.status === 'qr_ready' ? d.qrCode : null);
      setBotLastError(d.lastError || null);
      setBotRetryCount(d.retryCount || 0);
    } catch {
      setBotStatus('error');
    }
  }, []);

  useEffect(() => {
    if (tab !== 'bot') { setPolling(false); return; }
    setPolling(true);
    fetchBotStatus();
    const interval = setInterval(fetchBotStatus, 2000);
    return () => { clearInterval(interval); setPolling(false); };
  }, [tab, fetchBotStatus]);

  const handleBotStart = async () => {
    try {
      await whatsappBotAPI.start();
      toast.success('Bot starting...');
    } catch { toast.error('Failed to start bot'); }
  };

  const handleBotDisconnect = async () => {
    try {
      await whatsappBotAPI.disconnect();
      toast.success('Bot disconnected');
    } catch { toast.error('Failed to disconnect'); }
  };

  const handleBotClearAuth = async () => {
    try {
      await whatsappBotAPI.clearAuth();
      toast.success('Auth cleared');
      setBotQr(null);
    } catch { toast.error('Failed to clear auth'); }
  };

  const toggleHiddenSection = async (slug: string) => {
    const hidden = [...((form.hiddenSections as string[]) || [])];
    const idx = hidden.indexOf(slug);
    if (idx > -1) hidden.splice(idx, 1);
    else hidden.push(slug);
    const updated = { ...form, hiddenSections: hidden };
    setForm(updated);
  };

  if (!settings) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;

  const section = (title: string, desc: string) => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  );

  const input = (label: string, key: string, type = 'text') => (
    <div className="mb-4">
      <Input id={`s-${key}`} label={label} type={type} value={String((form as Record<string, unknown>)[key] || '')} onChange={e => setForm((prev: Record<string, unknown>) => ({ ...prev, [key]: e.target.value }))} />
    </div>
  );

  return (
    <>
      <Helmet><title>Settings - Admin Panel</title></Helmet>
      <div className="space-y-6 max-w-3xl">
        <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Settings</h1>

        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
          {([
            ['general', 'General'],
            ['branding', 'Branding'],
            ['contact', 'Contact'],
            ['sections', 'Sections'],
            ['bot', 'WhatsApp Bot'],
          ] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === key ? 'text-amber-600 border-b-2 border-amber-500' : 'text-gray-500 hover:text-gray-700'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          {tab === 'general' && (
            <>
              {section('General Settings', 'Basic shop information')}
              {input('Shop Name', 'shopName')}
              {input('About Title', 'aboutTitle')}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">About Description</label>
                <textarea value={String((form as Record<string, unknown>).aboutDescription || '')} onChange={e => setForm((prev: Record<string, unknown>) => ({ ...prev, aboutDescription: e.target.value }))} rows={4} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 outline-none transition-colors" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">About Banner Image</label>
                {!!(form as Record<string, unknown>).aboutImage && (
                  <img src={String((form as Record<string, unknown>).aboutImage)} alt="About Banner" className="w-full aspect-[4/3] object-cover mb-2 rounded-lg bg-gray-100" />
                )}
                <div className="flex items-center gap-2">
                  <input type="text" value={String((form as Record<string, unknown>).aboutImage || '')} onChange={e => setForm((prev: Record<string, unknown>) => ({ ...prev, aboutImage: e.target.value }))} placeholder="About banner image URL" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 outline-none transition-colors" />
                  <label className="shrink-0 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 text-sm text-gray-600 dark:text-gray-300">
                    {uploading ? '...' : 'Upload'}
                    <input type="file" accept="image/*" onChange={handleAboutImageUpload} className="hidden" disabled={uploading} />
                  </label>
                </div>
              </div>
              <div className="mb-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={Boolean((form as Record<string, unknown>).showPrice)} onChange={e => setForm((prev: Record<string, unknown>) => ({ ...prev, showPrice: e.target.checked }))} className="rounded border-gray-300 text-amber-500 focus:ring-amber-500" />
                  Show prices on website
                </label>
              </div>
              <hr className="my-6 border-gray-200 dark:border-gray-700" />
              {section('Header Banner', 'Banner text displayed at the top of the header')}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Banner Text</label>
                <input type="text" value={String((form as Record<string, unknown>).headerBanner || '')} onChange={e => setForm((prev: Record<string, unknown>) => ({ ...prev, headerBanner: e.target.value }))} placeholder="e.g. Free Shipping on orders above ₹10,000" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 outline-none transition-colors" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Live Rates Text</label>
                <input type="text" value={String((form as Record<string, unknown>).liveRatesText || '')} onChange={e => setForm((prev: Record<string, unknown>) => ({ ...prev, liveRatesText: e.target.value }))} placeholder="e.g. Gold ₹7,100/g | Silver ₹75/g" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 outline-none transition-colors" />
              </div>
            </>
          )}

          {tab === 'branding' && (
            <>
              {section('Branding', 'Logo, favicon and theme colors')}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Logo</label>
                {(form as Record<string, unknown>).logo && (
                  <img src={String((form as Record<string, unknown>).logo)} alt="Logo" className="h-auto w-auto max-h-20 mb-2 bg-gray-100 rounded-lg p-1" />
                )}
                <div className="flex items-center gap-2">
                  <Input value={String((form as Record<string, unknown>).logo || '')} onChange={e => setForm((prev: Record<string, unknown>) => ({ ...prev, logo: e.target.value }))} placeholder="Logo URL" />
                  <label className="shrink-0 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 text-sm text-gray-600 dark:text-gray-300">
                    {uploading ? '...' : 'Upload'}
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={uploading} />
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Input id="s-primary" label="Primary Color" type="color" value={String((form.theme as Record<string, string>)?.primary || '#D4AF37')} onChange={e => setForm((prev: Record<string, unknown>) => ({ ...prev, theme: { ...(prev.theme as Record<string, string> || {}), primary: e.target.value } }))} />
                <Input id="s-secondary" label="Secondary Color" type="color" value={String((form.theme as Record<string, string>)?.secondary || '#1C1C1E')} onChange={e => setForm((prev: Record<string, unknown>) => ({ ...prev, theme: { ...(prev.theme as Record<string, string> || {}), secondary: e.target.value } }))} />
                <Input id="s-accent" label="Accent Color" type="color" value={String((form.theme as Record<string, string>)?.accent || '#F8F5F0')} onChange={e => setForm((prev: Record<string, unknown>) => ({ ...prev, theme: { ...(prev.theme as Record<string, string> || {}), accent: e.target.value } }))} />
              </div>
            </>
          )}

          {tab === 'contact' && (
            <>
              {section('Contact Information', 'Phone, email, address and social links')}
              {input('WhatsApp Number', 'whatsappNumber')}
              {input('Phone', 'phone')}
              {input('Email', 'email')}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                <textarea value={String((form as Record<string, unknown>).address || '')} onChange={e => setForm((prev: Record<string, unknown>) => ({ ...prev, address: e.target.value }))} rows={3} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 outline-none transition-colors" />
              </div>
              {input('Facebook URL', 'socialLinks.facebook')}
              {input('Instagram URL', 'socialLinks.instagram')}
              {input('YouTube URL', 'socialLinks.youtube')}
              {input('Twitter URL', 'socialLinks.twitter')}
              <div className="grid grid-cols-2 gap-4 mt-4">
                {input('Gold 22K Rate (per g)', 'metalRates.gold22k', 'number')}
                {input('Gold 24K Rate (per g)', 'metalRates.gold24k', 'number')}
                {input('Silver Rate (per g)', 'metalRates.silver', 'number')}
                {input('Platinum Rate (per g)', 'metalRates.platinum', 'number')}
              </div>
            </>
          )}

          {tab === 'bot' && (
            <>
              {section('WhatsApp Bot', 'Connect your WhatsApp to send order and enquiry notifications automatically.')}
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className={`w-3 h-3 rounded-full ${botStatus === 'connected' ? 'bg-green-500' : botStatus === 'connecting' || botStatus === 'qr_ready' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{botStatus === 'qr_ready' ? 'Ready to scan' : botStatus}</span>
                  {botStatus === 'connected' && <span className="text-xs text-green-600 ml-2">Orders will be sent automatically</span>}
                  {botRetryCount > 0 && <span className="text-xs text-gray-500 ml-2">(retry #{botRetryCount})</span>}
                </div>

                {botLastError && botStatus === 'error' && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">Connection Error</p>
                    <p className="text-xs text-red-600 dark:text-red-300 mt-1 font-mono break-all">{botLastError}</p>
                  </div>
                )}

                {botQr && (
                  <div className="text-center p-4 bg-white dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-500 mb-3">Scan this QR code with your WhatsApp to connect the bot</p>
                    <img src={botQr} alt="WhatsApp QR Code" className="mx-auto w-56 h-56" />
                    <p className="text-xs text-gray-400 mt-2">Open WhatsApp → Linked Devices → Link a Device</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  {botStatus !== 'connected' && (
                    <Button onClick={handleBotStart} size="sm" disabled={botStatus === 'connecting' || botStatus === 'qr_ready'}>
                      Start Bot
                    </Button>
                  )}
                  {botStatus === 'connected' && (
                    <Button onClick={handleBotDisconnect} size="sm" variant="secondary">
                      Disconnect
                    </Button>
                  )}
                  <Button onClick={handleBotClearAuth} size="sm" variant="secondary" className="!text-red-600 !border-red-300 hover:!bg-red-50">
                    Clear Auth & Reset
                  </Button>
                </div>

                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-medium text-gray-900 dark:text-white mb-1">How it works</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Click "Start Bot" to generate a QR code</li>
                    <li>Scan with WhatsApp → Linked Devices</li>
                    <li>Once connected, new orders and enquiries are sent directly to your WhatsApp number</li>
                    <li>The bot reconnects automatically if disconnected</li>
                    <li>On server restart with existing auth, the bot connects automatically</li>
                  </ul>
                </div>
              </div>
            </>
          )}

          {tab === 'sections' && (
            <>
              {section('Section Visibility', 'Toggle which sections are visible on the website')}
              <p className="text-sm text-gray-500 mb-4">Disabled sections will be hidden from customers everywhere on the site.</p>
              <div className="space-y-3">
                {categories.map(cat => (
                  <div key={cat._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{cat.name}</p>
                      <p className="text-xs text-gray-500">{cat.productCount} products</p>
                    </div>
                    <button
                      onClick={() => toggleHiddenSection(cat.slug)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        ((form.hiddenSections as string[]) || []).includes(cat.slug)
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {((form.hiddenSections as string[]) || []).includes(cat.slug) ? 'Hidden' : 'Visible'}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <Button onClick={handleSave} loading={saving}>Save Settings</Button>
          </div>
        </div>
      </div>
    </>
  );
}
