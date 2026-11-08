import React from 'react';
import { ContactInfoList } from '../components/ContactInfoList';
import { ContactForm } from '../components/ContactForm';
import { LocationSection } from '../components/LocationSection';
import { Footer } from '../components/Footer';
import { motion } from 'motion/react';
import { GoldFlickers } from '../components/GoldFlickers';

interface ContactProps {
  onOpenAdmin: () => void;
  onOpenChat: () => void;
  onNavigate?: (page: 'home' | 'menu' | 'reserve' | 'contact') => void;
}

export const Contact: React.FC<ContactProps> = ({ onOpenAdmin, onOpenChat, onNavigate }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#0D0D0D] text-stone-100">
      {/* Hero & Contact Form Section */}
      <section className="relative w-full overflow-hidden pt-8 pb-16 lg:pb-24">
        {/* Background Photo with Cozy Restaurant Interior & MiniKitchen Glow */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src="/src/assets/images/hero_restaurant_ambiance_1793941743774.jpg"
            alt="MiniKitchen warm restaurant ambiance"
            className="w-full h-full object-cover object-right lg:object-center opacity-70"
          />
          {/* Left-to-right dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0D] via-[#0D0D0D]/90 sm:via-[#0D0D0D]/75 md:via-[#0D0D0D]/60 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0D0D0D] to-transparent pointer-events-none" />
        </div>
        <GoldFlickers />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 items-start">
            {/* Left Column: Heading + Description + 4 Stacked Contact Cards */}
            <div className="lg:col-span-6 space-y-6 sm:space-y-8">
              {/* Heading */}
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="font-serif text-4xl sm:text-5xl lg:text-[56px] font-bold tracking-tight text-white leading-[1.1] mb-3"
                >
                  Contact <span className="text-[#F5B82E]">Us</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
                  className="text-stone-300 text-sm sm:text-base max-w-[430px] leading-relaxed font-sans font-light"
                >
                  We&apos;d love to hear from you. Reach out for reservations, inquiries or any assistance.
                </motion.p>
              </div>

              {/* 4 Stacked Contact Information Cards */}
              <ContactInfoList />
            </div>

            {/* Right Column: Floating Cream-Colored Contact Form */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Location Map & Restaurant Exterior Entrance Section */}
      <LocationSection />

      {/* Footer */}
      <Footer onOpenAdmin={onOpenAdmin} onOpenChat={onOpenChat} onNavigate={onNavigate} />
    </div>
  );
};
