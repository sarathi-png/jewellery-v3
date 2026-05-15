import { useState, useEffect } from 'react';
import { settingsAPI } from '@/lib/api';
import type { AxiosResponse } from 'axios';

interface SiteSettings {
  _id: string;
  shopName: string;
  logo: string;
  favicon: string;
  whatsappNumber: string;
  phone: string;
  email: string;
  address: string;
  socialLinks: { facebook: string; instagram: string; youtube: string; twitter: string };
  theme: { primary: string; secondary: string; accent: string };
  metalRates: { gold22k: number; gold24k: number; silver: number; platinum: number };
  aboutTitle: string;
  aboutDescription: string;
  aboutImage: string;
  hiddenSections: string[];
  showPrice: boolean;
}

interface UseSettingsReturn {
  settings: SiteSettings | null;
  loading: boolean;
  refetch: () => void;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const res: AxiosResponse = await settingsAPI.get();
      setSettings(res.data.data.settings);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return { settings, loading, refetch: fetch };
}
