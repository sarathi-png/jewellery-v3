import { Helmet } from '@/lib/helmet';
import { motion } from 'framer-motion';
import { Shield, Gem, Heart, Star } from 'lucide-react';
import { useSiteSettings } from '@/context/SettingsContext';

export default function About() {
  const { settings } = useSiteSettings();

  const values = [
    { icon: Gem, title: 'Authenticity', text: 'Every piece comes with a certificate of authenticity. We source only certified gems and hallmarked gold.' },
    { icon: Heart, title: 'Craftsmanship', text: 'Our master artisans combine traditional techniques with modern design to create timeless pieces.' },
    { icon: Shield, title: 'Trust', text: 'For over 45 years, we have built a reputation of trust, transparency, and exceptional quality.' },
    { icon: Star, title: 'Excellence', text: 'We strive for excellence in every aspect, from product quality to customer service.' },
  ];

  return (
    <>
      <Helmet>
        <title>{`About - ${settings?.shopName || 'Luxury Jewels'}`}</title>
        <meta name="description" content={settings?.aboutDescription || 'Learn about our story, mission, and commitment to quality.'} />
      </Helmet>

      <div className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <h1 className="text-3xl lg:text-5xl font-serif font-bold text-gray-900 dark:text-white">
            {settings?.aboutTitle || 'Our Story'}
          </h1>
        </div>
      </div>

      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-200">
                {settings?.aboutImage ? (
                  <img src={settings.aboutImage} alt="About us" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Gem className="w-16 h-16" />
                  </div>
                )}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl lg:text-3xl font-serif font-bold text-gray-900 dark:text-white mb-4">
                {settings?.aboutTitle || 'Our Story'}
              </h2>
              <div className="w-16 h-0.5 bg-amber-500 mb-6" />
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                {settings?.aboutDescription || 'For over three generations, we have been a beacon of trust and exquisite craftsmanship in fine jewellery. Every piece we create tells a story — of tradition, of precision, and of timeless beauty.'}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-accent dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-gray-900 dark:text-white">
              Our Values
            </h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
              What sets us apart
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-4">
                  <v.icon className="w-7 h-7 text-amber-600" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-gray-900 dark:text-white mb-2">{v.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{v.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
