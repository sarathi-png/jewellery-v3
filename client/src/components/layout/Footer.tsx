import { Link } from 'react-router-dom';
import { Heart, Shield, Award, Gem, Facebook, Instagram, Youtube, Twitter } from 'lucide-react';
import { useSiteSettings } from '@/context/SettingsContext';

export default function Footer() {
  const { settings } = useSiteSettings();

  return (
    <footer className="bg-secondary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              {settings?.logo ? (
                <img src={settings.logo} alt={settings.shopName} className="h-auto w-auto max-h-14 bg-white/10 rounded-lg p-1" />
              ) : (
                <Gem className="w-6 h-6 text-amber-400" />
              )}
              <span className="text-lg font-serif font-bold gradient-gold-text">
                {settings?.shopName || 'Luxury Jewels'}
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Crafting timeless elegance since 1975. Our commitment to quality and authenticity makes every piece a treasure.
            </p>
            <div className="flex gap-3 mt-4">
              {settings?.socialLinks?.facebook && (
                <a href={settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-lg hover:bg-amber-600 transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings?.socialLinks?.instagram && (
                <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-lg hover:bg-amber-600 transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings?.socialLinks?.youtube && (
                <a href={settings.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-lg hover:bg-amber-600 transition-colors">
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {settings?.socialLinks?.twitter && (
                <a href={settings.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-lg hover:bg-amber-600 transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {[
                { to: '/', label: 'Home' },
                { to: '/products', label: 'All Products' },
                { to: '/about', label: 'About Us' },
                { to: '/contact', label: 'Contact' },
                { to: '/cart', label: 'Cart' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-gray-400 hover:text-amber-400 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">Categories</h3>
            <ul className="space-y-2.5">
              {['gold', 'silver', 'diamond', 'platinum'].map((cat) => (
                <li key={cat}>
                  <Link to={`/products?category=${cat}`} className="text-gray-400 hover:text-amber-400 text-sm capitalize transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">Contact</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              {settings?.address && <li>{settings.address}</li>}
              {settings?.phone && (
                <li>
                  <a href={`tel:${settings.phone}`} className="hover:text-amber-400 transition-colors">{settings.phone}</a>
                </li>
              )}
              {settings?.email && (
                <li>
                  <a href={`mailto:${settings.email}`} className="hover:text-amber-400 transition-colors">{settings.email}</a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Shield, text: 'BIS Hallmarked' },
              { icon: Award, text: 'Certified Gems' },
              { icon: Heart, text: 'Lifetime Polish' },
              { icon: Shield, text: 'Secure Shipping' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-gray-500 text-xs">
                <item.icon className="w-4 h-4 text-amber-500" />
                {item.text}
              </div>
            ))}
          </div>
          <p className="text-center text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} {settings?.shopName || 'Luxury Jewels'}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
