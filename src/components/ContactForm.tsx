import React, { useState } from 'react';
import { Mail, User, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { submitContactForm, ContactFormData } from '../services/contactApi';

export const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Please enter your full name (minimum 2 characters).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address.';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Please select a subject.';
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      newErrors.message = 'Your message must be at least 10 characters long.';
    } else if (formData.message.trim().length > 2000) {
      newErrors.message = 'Message cannot exceed 2000 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setLoading(true);
    try {
      await submitContactForm(formData);
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: 'General Inquiry',
        message: '',
      });
      setErrors({});
    } catch (err: any) {
      setServerError(err.message || 'Something went wrong. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
      className="w-full max-w-[540px] bg-[#FFF8EB] rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl border border-[#F5E8D8] text-stone-900 relative"
    >
      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="py-12 text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-300 shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              Message Sent Successfully!
            </h3>

            <p className="text-stone-600 text-sm max-w-sm mx-auto leading-relaxed">
              Thank you for contacting MiniKitchen! We&apos;ve received your message and will get back to you soon.
            </p>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => setSuccess(false)}
                className="px-6 py-2.5 rounded-xl bg-[#0D0D0D] text-white hover:bg-stone-800 transition-colors text-xs font-semibold shadow-md"
              >
                Send Another Message
              </button>
            </div>
          </motion.div>
        ) : (
          <form key="form" onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" noValidate>
            {/* Header: Send a Message */}
            <div className="flex items-center gap-2.5 pb-2 border-b border-[#F5E8D8]">
              <div className="w-8 h-8 rounded-lg bg-amber-100/70 text-[#D4A43C] flex items-center justify-center">
                <Mail className="w-4 h-4 stroke-[2]" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#0D0D0D] tracking-tight">
                Send a Message
              </h3>
            </div>

            {/* Server Error Alert */}
            {serverError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Row 1: Full Name & Email Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label htmlFor="contact-name" className="block text-xs font-semibold text-[#171717]">
                  Full Name <span className="text-[#D4A43C]">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="contact-name"
                    type="text"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: undefined });
                    }}
                    className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-white border ${
                      errors.name ? 'border-red-400 ring-1 ring-red-400' : 'border-[#E8DED3]'
                    } text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#D4A43C] transition-all`}
                  />
                </div>
                {errors.name && (
                  <p className="text-[11px] text-red-600 font-medium">{errors.name}</p>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label htmlFor="contact-email" className="block text-xs font-semibold text-[#171717]">
                  Email Address <span className="text-[#D4A43C]">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="contact-email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                    className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-white border ${
                      errors.email ? 'border-red-400 ring-1 ring-red-400' : 'border-[#E8DED3]'
                    } text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#D4A43C] transition-all`}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-red-600 font-medium">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Row 2: Subject */}
            <div className="space-y-1.5">
              <label htmlFor="contact-subject" className="block text-xs font-semibold text-[#171717]">
                Subject <span className="text-[#D4A43C]">*</span>
              </label>
              <div className="relative">
                <select
                  id="contact-subject"
                  value={formData.subject}
                  onChange={(e) => {
                    setFormData({ ...formData, subject: e.target.value });
                    if (errors.subject) setErrors({ ...errors, subject: undefined });
                  }}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-white border border-[#E8DED3] text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#D4A43C] transition-all appearance-none cursor-pointer"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Reservation Inquiry">Reservation Inquiry</option>
                  <option value="Menu Question">Menu Question</option>
                  <option value="Feedback">Feedback</option>
                  <option value="Other">Other</option>
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400 text-xs">
                  ▼
                </div>
              </div>
              {errors.subject && (
                <p className="text-[11px] text-red-600 font-medium">{errors.subject}</p>
              )}
            </div>

            {/* Row 3: Message */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="contact-message" className="block text-xs font-semibold text-[#171717]">
                  Message <span className="text-[#D4A43C]">*</span>
                </label>
                <span className="text-[10px] text-stone-400">
                  {formData.message.length} / 2000
                </span>
              </div>
              <textarea
                id="contact-message"
                rows={4}
                placeholder="Type your message here..."
                value={formData.message}
                onChange={(e) => {
                  setFormData({ ...formData, message: e.target.value });
                  if (errors.message) setErrors({ ...errors, message: undefined });
                }}
                className={`w-full p-3 text-xs sm:text-sm rounded-xl bg-white border ${
                  errors.message ? 'border-red-400 ring-1 ring-red-400' : 'border-[#E8DED3]'
                } text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#D4A43C] transition-all resize-none`}
              />
              {errors.message && (
                <p className="text-[11px] text-red-600 font-medium">{errors.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#F5B82E] to-[#D4A43C] hover:from-[#eab12b] hover:to-[#c6942c] text-[#0D0D0D] font-bold text-sm shadow-md active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#0D0D0D] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </form>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
