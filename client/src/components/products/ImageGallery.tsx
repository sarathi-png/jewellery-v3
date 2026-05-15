import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';

interface ImageGalleryProps {
  images: string[];
  productName: string;
}

export default function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!images.length) {
    return (
      <div className="aspect-square rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <span className="text-gray-400">No image</span>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div
          className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer group"
          onClick={() => setLightboxOpen(true)}
        >
          <img
            src={getImageUrl(images[selectedIndex])}
            alt={productName}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedIndex((prev) => (prev - 1 + images.length) % images.length); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow hover:bg-white dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedIndex((prev) => (prev + 1) % images.length); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow hover:bg-white dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedIndex(i)}
                className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-colors ${
                  i === selectedIndex ? 'border-amber-500' : 'border-transparent hover:border-gray-300'
                }`}
              >
                <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            <button className="absolute top-4 right-4 p-2 text-white hover:text-amber-400 transition-colors">
              <X className="w-6 h-6" />
            </button>
            <motion.img
              key={selectedIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={getImageUrl(images[selectedIndex])}
              alt={productName}
              className="max-w-[90vw] max-h-[90vh] object-contain"
            />
            {images.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); setSelectedIndex((prev) => (prev - 1 + images.length) % images.length); }} className="absolute left-4 p-2 text-white hover:text-amber-400">
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); setSelectedIndex((prev) => (prev + 1) % images.length); }} className="absolute right-4 p-2 text-white hover:text-amber-400">
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
