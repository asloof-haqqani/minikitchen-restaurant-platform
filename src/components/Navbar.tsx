import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu as MenuIcon, Sparkles } from 'lucide-react';
import { NavLinks } from './NavLinks';
import { AdminLoginButton } from './AdminLoginButton';
import { MobileNavDrawer } from './MobileNavDrawer';

export const OFFICIAL_LOGO_URL = 'https://i.postimg.cc/564H5nPc/b64a9666-75f4-4947-85c6-0591435cd1c6.png';
export const LOGO_URL = OFFICIAL_LOGO_URL;

export type ActivePage = 'home' | 'menu' | 'reserve' | 'contact';

interface NavbarProps {
  currentView?: 'public' | 'admin';
  setCurrentView?: (view: 'public' | 'admin') => void;
  activePage?: ActivePage;
  setActivePage?: (page: ActivePage) => void;
  openAdminModal?: () => void;
  isAdminLoggedIn?: boolean;
  pendingCount?: number;
  onReplayWelcome?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  openAdminModal,
  onReplayWelcome,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const mobileMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  // Scroll detection: > 60px switches to solid charcoal/black background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0D0D0D]/95 backdrop-blur-md border-b border-[#171717] shadow-xl'
            : 'bg-[#0D0D0D]/85 backdrop-blur-md border-b border-[#171717]/60'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] sm:h-[90px] grid grid-cols-2 md:grid-cols-3 items-center">
          {/* LEFT ZONE: MiniKitchen Logo */}
          <div className="flex items-center justify-start">
            <Link
              to="/"
              className="flex items-center focus:outline-none group"
              aria-label="MiniKitchen Home"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <img
                src={OFFICIAL_LOGO_URL}
                alt="MiniKitchen"
                className="w-[110px] sm:w-[130px] lg:w-[140px] h-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
          </div>

          {/* CENTER ZONE: Navigation Links (Desktop 768px+) */}
          <div className="hidden md:flex items-center justify-center">
            <NavLinks />
          </div>

          {/* RIGHT ZONE: Admin Login Button & Mobile Hamburger */}
          <div className="flex items-center justify-end gap-3">
            {/* Optional Replay Welcome Button */}
            {onReplayWelcome && (
              <button
                onClick={onReplayWelcome}
                className="hidden xl:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-stone-300 hover:text-[#F5B82E] hover:bg-[#171717] transition-all text-xs font-medium cursor-pointer"
                title="Watch Welcome Experience"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D4A43C]" />
                <span>Welcome</span>
              </button>
            )}

            {/* Desktop Admin Login Button */}
            <div className="hidden md:block">
              <AdminLoginButton onClick={openAdminModal} />
            </div>

            {/* Mobile Hamburger Button */}
            <button
              ref={mobileMenuTriggerRef}
              onClick={() => setMobileDrawerOpen(true)}
              className="p-2.5 rounded-xl text-stone-300 hover:text-white hover:bg-[#171717] md:hidden transition-colors border border-transparent hover:border-stone-800 focus:outline-none focus:ring-2 focus:ring-[#D4A43C] cursor-pointer"
              aria-label="Open navigation menu"
              aria-expanded={mobileDrawerOpen}
              aria-controls="mobile-nav-drawer"
            >
              <MenuIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <MobileNavDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        triggerRef={mobileMenuTriggerRef}
        logoUrl={OFFICIAL_LOGO_URL}
        onReplayWelcome={onReplayWelcome}
      />
    </>
  );
};
