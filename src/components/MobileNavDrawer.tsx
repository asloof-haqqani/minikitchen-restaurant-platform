import React, { useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  House,
  UtensilsCrossed,
  CalendarDays,
  Mail,
  Sparkles,
} from 'lucide-react';
import { AdminLoginButton } from './AdminLoginButton';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  logoUrl: string;
  onReplayWelcome?: () => void;
}

const MOBILE_NAV_ITEMS = [
  { label: 'Home', path: '/', icon: House },
  { label: 'Menu', path: '/menu', icon: UtensilsCrossed },
  { label: 'Reserve', path: '/reservations', icon: CalendarDays },
  { label: 'Contact', path: '/contact', icon: Mail },
];

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  isOpen,
  onClose,
  triggerRef,
  logoUrl,
  onReplayWelcome,
}) => {
  const navigate = useNavigate();
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);

  // Prevent background scrolling while drawer is open
  useEffect(() => {
    if (isOpen) {
      wasOpenRef.current = true;
      previousFocusRef.current = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
      document.body.style.overflow = 'hidden';
      drawerRef.current?.querySelector<HTMLElement>('button, a')?.focus();
    } else {
      document.body.style.overflow = '';
      if (wasOpenRef.current) {
        (previousFocusRef.current ?? triggerRef.current)?.focus();
        wasOpenRef.current = false;
      }
      previousFocusRef.current = null;
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, triggerRef]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleLinkClick = () => {
    onClose();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
            className="fixed inset-0 z-50 bg-[#0D0D0D]/80 backdrop-blur-sm md:hidden"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <motion.div
            ref={drawerRef}
            id="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-xs bg-[#171717] border-l border-stone-800 p-6 flex flex-col justify-between shadow-2xl md:hidden text-white"
          >
            <div>
              {/* Header with Logo and Close Button */}
              <div className="flex items-center justify-between pb-6 border-b border-stone-800">
                <button
                  onClick={() => {
                    navigate('/');
                    handleLinkClick();
                  }}
                  className="flex items-center focus:outline-none"
                >
                  <img
                    src={logoUrl}
                    alt="MiniKitchen"
                    className="w-[110px] h-auto object-contain"
                  />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
                  aria-label="Close navigation menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation Items with Icons */}
              <motion.nav
                className="flex flex-col gap-2 py-6"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
                }}
              >
                {MOBILE_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.path}
                      variants={{
                        hidden: { opacity: 0, x: 12 },
                        visible: { opacity: 1, x: 0 },
                      }}
                    >
                      <NavLink
                        to={item.path}
                        end={item.path === '/'}
                        onClick={handleLinkClick}
                        className={({ isActive }) =>
                          `flex items-center gap-3.5 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                            isActive
                              ? 'bg-[#D4A43C]/15 text-[#F5B82E] font-semibold border border-[#D4A43C]/30'
                              : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                          }`
                        }
                      >
                        <Icon className="w-5 h-5 stroke-[2] shrink-0" />
                        <span>{item.label}</span>
                      </NavLink>
                    </motion.div>
                  );
                })}

                {/* Optional Welcome Experience Replay */}
                {onReplayWelcome && (
                  <button
                    onClick={() => {
                      onClose();
                      onReplayWelcome();
                    }}
                    className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-stone-400 hover:text-[#F5B82E] hover:bg-stone-800/40 transition-colors text-left cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[#D4A43C] shrink-0" />
                    <span>Welcome Page</span>
                  </button>
                )}
              </motion.nav>
            </div>

            {/* Bottom Section: Divider & Full-Width Admin Login Button */}
            <div className="pt-4 border-t border-stone-800 space-y-4">
              <AdminLoginButton
                fullWidth
                onClick={() => {
                  onClose();
                  navigate('/admin/login');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
              <p className="text-center text-[11px] text-stone-500 font-sans">
                Good Food, Great Moments.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
