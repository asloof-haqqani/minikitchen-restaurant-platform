import React from 'react';
import { X, User, Clock, Phone, MapPin, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdmin: () => void;
  logoUrl: string;
  onNavigateHome: () => void;
  onNavigateMenu: () => void;
  onNavigateReserve: () => void;
  onNavigateContact: () => void;
  onReplayWelcome?: () => void;
  activePage: 'home' | 'menu' | 'reserve' | 'contact';
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  onOpenAdmin,
  logoUrl,
  onNavigateHome,
  onNavigateMenu,
  onNavigateReserve,
  onNavigateContact,
  onReplayWelcome,
  activePage,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-[#0D0D0D]/80 backdrop-blur-sm lg:hidden"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-xs bg-[#0D0D0D] border-l border-[#171717] p-6 flex flex-col justify-between shadow-2xl lg:hidden text-white"
          >
            <div>
              {/* Header with Logo and Close Button */}
              <div className="flex items-center justify-between pb-6 border-b border-[#171717]">
                <img
                  src={logoUrl}
                  alt="MiniKitchen"
                  className="w-[125px] h-auto object-contain"
                />
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-[#171717] transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col gap-4 py-8">
                <button
                  onClick={() => {
                    onClose();
                    onNavigateHome();
                  }}
                  className={`text-lg font-medium py-2 border-b border-[#171717]/60 flex items-center justify-between w-full text-left transition-colors ${
                    activePage === 'home' ? 'text-white' : 'text-stone-300 hover:text-white'
                  }`}
                >
                  <span>Home</span>
                  {activePage === 'home' && <span className="w-2 h-2 rounded-full bg-[#D4A43C]" />}
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onNavigateMenu();
                  }}
                  className={`text-lg font-medium py-2 border-b border-[#171717]/60 flex items-center justify-between w-full text-left transition-colors ${
                    activePage === 'menu' ? 'text-white' : 'text-stone-300 hover:text-white'
                  }`}
                >
                  <span>Menu</span>
                  {activePage === 'menu' && <span className="w-2 h-2 rounded-full bg-[#D4A43C]" />}
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onNavigateReserve();
                  }}
                  className={`text-lg font-medium py-2 border-b border-[#171717]/60 flex items-center justify-between w-full text-left transition-colors ${
                    activePage === 'reserve' ? 'text-white' : 'text-stone-300 hover:text-white'
                  }`}
                >
                  <span>Reserve</span>
                  {activePage === 'reserve' && <span className="w-2 h-2 rounded-full bg-[#D4A43C]" />}
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onNavigateContact();
                  }}
                  className={`text-lg font-medium py-2 border-b border-[#171717]/60 flex items-center justify-between w-full text-left transition-colors ${
                    activePage === 'contact' ? 'text-white' : 'text-stone-300 hover:text-white'
                  }`}
                >
                  <span>Contact</span>
                  {activePage === 'contact' && <span className="w-2 h-2 rounded-full bg-[#D4A43C]" />}
                </button>
              </nav>

              {/* Welcome Animation & Admin Login Buttons */}
              <div className="pt-2 space-y-2">
                {onReplayWelcome && (
                  <button
                    onClick={() => {
                      onClose();
                      onReplayWelcome();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-stone-800 bg-[#171717] hover:border-[#D4A43C]/40 text-[#F5B82E] transition-all font-medium text-xs cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Watch Welcome Animation</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    onClose();
                    onOpenAdmin();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[#D4A43C] text-[#D4A43C] hover:bg-[#D4A43C] hover:text-[#0D0D0D] transition-all font-semibold text-sm cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>Admin Login</span>
                </button>
              </div>
            </div>

            {/* Quick Details at Bottom */}
            <div className="space-y-3 pt-6 border-t border-[#171717] text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D4A43C]" />
                <span>11:00 AM – 10:00 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D4A43C]" />
                <span>+94 76 673 7844</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D4A43C]" />
                <span>Colombo, Sri Lanka</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
