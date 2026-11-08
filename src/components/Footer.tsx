import React from 'react';
import { OFFICIAL_LOGO_URL } from './Navbar';
import { ShieldCheck, Heart, Clock, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
  onOpenChat: () => void;
  onNavigate?: (page: 'home' | 'menu' | 'reserve' | 'contact') => void;
  onReplayWelcome?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, onOpenChat, onNavigate, onReplayWelcome }) => {
  const handleNav = (page: 'home' | 'menu' | 'reserve' | 'contact') => {
    if (onNavigate) {
      onNavigate(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#0D0D0D] text-stone-400 py-14 border-t border-[#171717] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-[#171717]">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <img
              src={OFFICIAL_LOGO_URL}
              alt="MiniKitchen"
              className="w-[140px] h-auto object-contain"
            />
            <p className="font-serif italic text-sm text-[#D4A43C]">
              Good Food, Great Moments.
            </p>
            <p className="text-stone-400 max-w-sm text-xs leading-relaxed">
              Freshly prepared meals, a cozy atmosphere and a table always ready for you. Experience intimate bistro dining in the heart of Colombo.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <span className="text-white font-semibold text-sm tracking-wider uppercase block">
              Quick Links
            </span>
            <ul className="space-y-2 text-stone-300">
              <li>
                <button
                  onClick={() => handleNav('home')}
                  className="hover:text-[#D4A43C] transition-colors text-left cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('menu')}
                  className="hover:text-[#D4A43C] transition-colors text-left cursor-pointer"
                >
                  Food Menu
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('reserve')}
                  className="hover:text-[#D4A43C] transition-colors text-left cursor-pointer"
                >
                  Table Reservations
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('contact')}
                  className="hover:text-[#D4A43C] transition-colors text-left cursor-pointer"
                >
                  Contact Us
                </button>
              </li>
              {onReplayWelcome && (
                <li>
                  <button
                    onClick={onReplayWelcome}
                    className="hover:text-[#F5B82E] text-[#D4A43C] transition-colors text-left cursor-pointer flex items-center gap-1.5"
                  >
                    <span>✨ Welcome Experience</span>
                  </button>
                </li>
              )}
              <li>
                <button
                  onClick={onOpenChat}
                  className="hover:text-[#D4A43C] transition-colors text-left"
                >
                  AI Reservation Concierge
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-[#D4A43C] transition-colors flex items-center gap-1.5 text-stone-300"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D4A43C]" />
                  <span>Admin Dashboard</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="md:col-span-4 space-y-3">
            <span className="text-white font-semibold text-sm tracking-wider uppercase block">
              Contact & Hours
            </span>
            <div className="space-y-2.5 text-stone-300">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#D4A43C] shrink-0 mt-0.5" />
                <span>Mon – Sun | 11:00 AM – 10:00 PM</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#D4A43C] shrink-0 mt-0.5" />
                <a href="tel:+94766737844" className="hover:text-[#D4A43C] font-mono transition-colors">
                  +94 76 673 7844
                </a>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D4A43C] shrink-0 mt-0.5" />
                <span>Colombo, Sri Lanka</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-stone-500 text-[11px]">
          <p>&copy; {new Date().getFullYear()} MiniKitchen. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span>Handcrafted with</span>
            <Heart className="w-3.5 h-3.5 text-[#D4A43C] fill-[#D4A43C]" />
            <span>for exquisite dining moments.</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
