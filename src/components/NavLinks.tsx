import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';

interface NavLinksProps {
  onNavigate?: () => void;
  className?: string;
}

export const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Menu', path: '/menu' },
  { label: 'Reserve', path: '/reservations' },
  { label: 'Contact', path: '/contact' },
];

export const NavLinks: React.FC<NavLinksProps> = ({ onNavigate, className = '' }) => {
  return (
    <nav className={`flex items-center gap-8 lg:gap-10 ${className}`}>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          onClick={() => {
            onNavigate?.();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={({ isActive }) =>
            `relative py-2 text-sm font-medium tracking-wide transition-colors whitespace-nowrap ${
              isActive ? 'text-[#F5B82E]' : 'text-stone-300 hover:text-white'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span>{item.label}</span>
              {isActive && (
                <motion.span
                  layoutId="activeNavUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D4A43C] rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};
