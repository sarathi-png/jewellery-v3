import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import type { AxiosResponse } from 'axios';
import { testimonialsAPI } from '@/lib/api';

interface Testimonial {
  _id: string;
  customerName: string;
  location: string;
  rating: number;
  avatar: string;
  review: string;
}

export default function TestimonialsCarousel() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    testimonialsAPI.getAll()
      .then((res: AxiosResponse) => setTestimonials(res.data.data.testimonials))
      .catch(() => {});
  }, []);

  if (!testimonials.length) return null;

  return (
    <section className="py-16 lg:py-20 bg-accent dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl lg:text-4xl font-serif font-bold text-gray-900 dark:text-white">
            What Our Customers Say
          </h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
            Trusted by thousands of happy customers
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15 } } }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {testimonials.map((t) => (
            <motion.div
              key={t._id}
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100 dark:border-gray-700 relative"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-amber-200 dark:text-amber-800" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-semibold text-lg">
                  {t.customerName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{t.customerName}</p>
                  {t.location && <p className="text-sm text-gray-500">{t.location}</p>}
                </div>
              </div>
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed italic">
                &ldquo;{t.review}&rdquo;
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
