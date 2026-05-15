import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { settingsAPI } from '@/lib/api';
import type { AxiosResponse } from 'axios';

interface SiteSettings {
  _id: string;
  shopName: string;
  logo: string;
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
  headerBanner: string;
  headerBannerImage: string;
  liveRatesText: string;
}

interface SettingsContextType {
  settings: SiteSettings | null;
  loading: boolean;
  refetch: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
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

  return (
    <SettingsContext.Provider value={{ settings, loading, refetch: fetch }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSiteSettings must be used within SettingsProvider');
  return ctx;
}
