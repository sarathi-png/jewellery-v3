import { useState } from 'react';
import { Helmet } from '@/lib/helmet';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, MessageCircle, Send, Star, MessageSquareQuote } from 'lucide-react';
import { useSiteSettings } from '@/context/SettingsContext';
import { enquiriesAPI, testimonialsAPI } from '@/lib/api';
import { getWhatsAppUrl } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function Contact() {
  const { settings } = useSiteSettings();
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const [reviewForm, setReviewForm] = useState({ customerName: '', location: '', rating: 5, review: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast.error('Name and phone are required');
      return;
    }
    setSubmitting(true);
    try {
      await enquiriesAPI.create(form);
      toast.success('Enquiry submitted! We will contact you shortly.');
      setForm({ name: '', phone: '', email: '', message: '' });
    } catch {
      toast.error('Failed to submit enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.customerName || !reviewForm.review) {
      toast.error('Name and review are required');
      return;
    }
    setReviewSubmitting(true);
    try {
      await testimonialsAPI.createPublic(reviewForm);
      toast.success('Thank you! Your review will be visible after approval.');
      setReviewForm({ customerName: '', location: '', rating: 5, review: '' });
    } catch {
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{`Contact - ${settings?.shopName || 'Luxury Jewels'}`}</title>
        <meta name="description" content="Get in touch with us. Visit our showroom, call us, or send a message on WhatsApp." />
      </Helmet>

      <div className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <h1 className="text-3xl lg:text-5xl font-serif font-bold text-gray-900 dark:text-white">Get in Touch</h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-lg">We would love to hear from you. Visit us or drop a message.</p>
        </div>
      </div>

      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  id="name"
                  label="Your Name *"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter your name"
                  required
                />
                <Input
                  id="phone"
                  label="Phone Number *"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Enter your phone number"
                  required
                />
                <Input
                  id="email"
                  label="Email (optional)"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Enter your email"
                />
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                  <textarea
                    id="message"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Your message..."
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-colors"
                  />
                </div>
                <Button type="submit" loading={submitting} className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-6">Contact Information</h2>

              {settings?.address && (
                <div className="flex items-start gap-4 p-4 bg-accent dark:bg-gray-800 rounded-xl">
                  <MapPin className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Address</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{settings.address}</p>
                  </div>
                </div>
              )}

              {settings?.phone && (
                <div className="flex items-start gap-4 p-4 bg-accent dark:bg-gray-800 rounded-xl">
                  <Phone className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Phone</h3>
                    <a href={`tel:${settings.phone}`} className="text-sm text-amber-600 hover:text-amber-700 mt-1 block">{settings.phone}</a>
                  </div>
                </div>
              )}

              {settings?.email && (
                <div className="flex items-start gap-4 p-4 bg-accent dark:bg-gray-800 rounded-xl">
                  <Mail className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Email</h3>
                    <a href={`mailto:${settings.email}`} className="text-sm text-amber-600 hover:text-amber-700 mt-1 block">{settings.email}</a>
                  </div>
                </div>
              )}

              {settings?.whatsappNumber && (
                <a
                  href={getWhatsAppUrl(settings.whatsappNumber, 'Hello! I would like to know more about your jewellery collections.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  Chat on WhatsApp
                </a>
              )}

              <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-800 mt-6">
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  Google Map Integration
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-accent dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
              <MessageSquareQuote className="w-10 h-10 text-amber-500 mx-auto mb-4" />
              <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Share Your Experience</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">We value your feedback. Leave us a review!</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <form onSubmit={handleReviewSubmit} className="bg-white dark:bg-gray-800 rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
                <Input
                  id="review-name"
                  label="Your Name *"
                  value={reviewForm.customerName}
                  onChange={(e) => setReviewForm({ ...reviewForm, customerName: e.target.value })}
                  placeholder="Enter your name"
                  required
                />
                <Input
                  id="review-location"
                  label="Location (optional)"
                  value={reviewForm.location}
                  onChange={(e) => setReviewForm({ ...reviewForm, location: e.target.value })}
                  placeholder="e.g. Mumbai, India"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button key={r} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: r })}>
                        <Star className={`w-7 h-7 ${r <= reviewForm.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label htmlFor="review-text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Review *</label>
                  <textarea
                    id="review-text"
                    value={reviewForm.review}
                    onChange={(e) => setReviewForm({ ...reviewForm, review: e.target.value })}
                    placeholder="Tell us about your experience..."
                    rows={4}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-colors"
                  />
                </div>
                <Button type="submit" loading={reviewSubmitting} className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Submit Review
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
