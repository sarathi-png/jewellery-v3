import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn, getImageUrl } from '@/lib/utils';
import type { AxiosResponse } from 'axios';
import { bannersAPI } from '@/lib/api';

interface Banner {
  _id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
}

export default function HeroSlider() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    bannersAPI.getAll().then((res: AxiosResponse) => setBanners(res.data.data.banners)).catch(() => {});
  }, []);

  useEffect(() => {
    if (banners.length < 2) return;
    const timer = setInterval(() => setCurrent((prev) => (prev + 1) % banners.length), 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (!banners.length) return null;

  const banner = banners[current];

  return (
    <div className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] overflow-hidden bg-gray-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <img
            src={getImageUrl(banner.image)}
            alt={banner.title}
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={current + '-content'}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-2xl"
            >
              {banner.title && (
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-3 leading-tight">
                  {banner.title}
                </h1>
              )}
              {banner.subtitle && (
                <p className="text-sm sm:text-base md:text-lg text-gray-200 mb-6 max-w-lg">
                  {banner.subtitle}
                </p>
              )}
              {banner.link && (
                <Link
                  to={banner.link}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-medium rounded-full hover:from-amber-700 hover:to-amber-600 transition-all shadow-lg hover:shadow-xl"
                >
                  Explore Collection
                </Link>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {banners.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((prev) => (prev - 1 + banners.length) % banners.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrent((prev) => (prev + 1) % banners.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  i === current ? 'bg-amber-500 w-6' : 'bg-white/50 hover:bg-white/80'
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
