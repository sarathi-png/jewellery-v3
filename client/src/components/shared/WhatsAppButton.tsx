import { useSiteSettings } from '@/context/SettingsContext';
import { getWhatsAppUrl } from '@/lib/utils';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  const { settings } = useSiteSettings();

  if (!settings?.whatsappNumber) return null;

  const url = getWhatsAppUrl(settings.whatsappNumber, 'Hello! I would like to know more about your jewellery collections.');

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 animate-bounce"
      style={{ animationDuration: '2s' }}
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  );
}
