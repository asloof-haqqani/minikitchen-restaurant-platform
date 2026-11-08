import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Utensils,
  ChefHat,
  Coffee,
  Wine,
  Pizza,
  Soup,
  Beef,
  Cake,
  Sparkles,
  Calendar,
  ArrowRight,
  X,
} from 'lucide-react';
import { OFFICIAL_LOGO_URL } from './Navbar';
import { restaurantImageUrl } from '../utils/restaurantImage';

interface WelcomeOverlayProps {
  isOpen: boolean;
  onExplore: () => void;
  onReserve: () => void;
  onClose: () => void;
}

// Floating food icons with mid opacity (0.35 - 0.55) drifting in the luxury ambiance
const FLOATING_ICONS = [
  {
    icon: Utensils,
    pos: 'top-[7%] left-[4%] sm:top-[12%] sm:left-[12%]',
    size: 'w-4 h-4 sm:w-6 sm:h-6',
    boxSize: 'w-10 h-10 sm:w-14 sm:h-14',
    dur: 5.5,
    delay: 0.1,
    yRange: [-12, 10, -12],
    xRange: [-4, 6, -4],
    rotateRange: [-8, 8, -8],
    label: 'Culinary',
    mobileVisible: true,
  },
  {
    icon: ChefHat,
    pos: 'top-[7%] right-[4%] sm:top-[10%] sm:right-[15%]',
    size: 'w-4 h-4 sm:w-7 sm:h-7',
    boxSize: 'w-10 h-10 sm:w-16 sm:h-16',
    dur: 6.2,
    delay: 0.3,
    yRange: [10, -14, 10],
    xRange: [6, -6, 6],
    rotateRange: [8, -6, 8],
    label: 'Chef',
    mobileVisible: true,
  },
  {
    icon: Beef,
    pos: 'bottom-[8%] left-[4%] sm:bottom-[16%] sm:left-[14%]',
    size: 'w-4 h-4 sm:w-6 sm:h-6',
    boxSize: 'w-10 h-10 sm:w-14 sm:h-14',
    dur: 5.8,
    delay: 0.2,
    yRange: [12, -10, 12],
    xRange: [-6, 4, -6],
    rotateRange: [-6, 6, -6],
    label: 'Grill',
    mobileVisible: true,
  },
  {
    icon: Wine,
    pos: 'bottom-[8%] right-[4%] sm:bottom-[18%] sm:right-[14%]',
    size: 'w-4 h-4 sm:w-6 sm:h-6',
    boxSize: 'w-10 h-10 sm:w-14 sm:h-14',
    dur: 5.2,
    delay: 0.4,
    yRange: [-10, 12, -10],
    xRange: [4, -4, 4],
    rotateRange: [6, -8, 6],
    label: 'Dining',
    mobileVisible: true,
  },
  {
    icon: Coffee,
    pos: 'top-[45%] left-[2%] sm:left-[6%]',
    size: 'w-4 h-4 sm:w-5 sm:h-5',
    boxSize: 'w-10 h-10 sm:w-12 sm:h-12',
    dur: 4.8,
    delay: 0.5,
    yRange: [-12, 12, -12],
    xRange: [-4, 6, -4],
    rotateRange: [-5, 5, -5],
    label: 'Beverages',
    mobileVisible: false,
  },
  {
    icon: Soup,
    pos: 'top-[42%] right-[2%] sm:right-[6%]',
    size: 'w-4 h-4 sm:w-5 sm:h-5',
    boxSize: 'w-10 h-10 sm:w-12 sm:h-12',
    dur: 5.0,
    delay: 0.6,
    yRange: [12, -12, 12],
    xRange: [6, -4, 6],
    rotateRange: [5, -5, 5],
    label: 'Pasta',
    mobileVisible: false,
  },
  {
    icon: Cake,
    pos: 'bottom-[4%] left-1/2 -translate-x-1/2',
    size: 'w-4 h-4 sm:w-5 sm:h-5',
    boxSize: 'w-10 h-10 sm:w-12 sm:h-12',
    dur: 6.0,
    delay: 0.7,
    yRange: [-10, 10, -10],
    xRange: [-6, 6, -6],
    rotateRange: [-4, 4, -4],
    label: 'Desserts',
    mobileVisible: false,
  },
];

export const WelcomeOverlay: React.FC<WelcomeOverlayProps> = ({
  isOpen,
  onExplore,
  onReserve,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="welcome-luxury-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.03 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-50 overflow-y-auto bg-[#0D0D0D] select-none flex items-center justify-center"
      >
        {/* Cinematic Restaurant Interior Background with Warm Glow & Dark Scrim */}
        <div className="fixed inset-0 w-full h-full pointer-events-none">
          <img
            src={restaurantImageUrl('/src/assets/images/hero_restaurant_ambiance_1793941743774.jpg')}
            alt="MiniKitchen warm restaurant ambiance"
            className="w-full h-full object-cover object-center scale-105 filter brightness-[0.38] contrast-[1.1]"
          />
          {/* Radial gold vignette & dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/80 to-[#0D0D0D]/90" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[650px] h-[350px] sm:h-[650px] rounded-full bg-radial from-[#D4A43C]/20 via-[#F5B82E]/5 to-transparent blur-3xl pointer-events-none" />
        </div>

        {/* Top Close / Skip Control */}
        <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-40">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#171717]/85 hover:bg-[#171717] text-stone-300 hover:text-white border border-[#D4A43C]/35 text-xs transition-colors cursor-pointer backdrop-blur-md shadow-lg"
            aria-label="Skip welcome page"
          >
            <span>Skip to Website</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ============================================================== */}
        {/* FLOATING FOOD ICONS IN MID OPACITY (NO FOOD IMAGES) */}
        {/* ============================================================== */}
        {FLOATING_ICONS.map((item, idx) => {
          const IconComponent = item.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{
                opacity: [0.35, 0.55, 0.35],
                y: item.yRange,
                x: item.xRange,
                rotate: item.rotateRange,
              }}
              transition={{
                opacity: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
                y: { duration: item.dur, repeat: Infinity, ease: 'easeInOut' },
                x: { duration: item.dur + 0.5, repeat: Infinity, ease: 'easeInOut' },
                rotate: { duration: item.dur + 1, repeat: Infinity, ease: 'easeInOut' },
                delay: item.delay,
              }}
              className={`fixed ${item.pos} z-20 pointer-events-none ${
                item.mobileVisible ? 'flex' : 'hidden sm:flex'
              } flex-col items-center gap-1 sm:gap-1.5`}
            >
              <div
                className={`${item.boxSize} rounded-xl sm:rounded-2xl bg-[#171717]/75 backdrop-blur-md border border-[#D4A43C]/35 flex items-center justify-center text-[#F5B82E] shadow-[0_8px_20px_rgba(0,0,0,0.6)]`}
              >
                <IconComponent className={`${item.size} stroke-[1.75]`} />
              </div>
              <span className="text-[9px] sm:text-[10px] uppercase font-mono tracking-wider text-[#D4A43C]/70 font-medium">
                {item.label}
              </span>
            </motion.div>
          );
        })}

        {/* ============================================================== */}
        {/* CENTRAL WELCOME CARD CONTENT */}
        {/* ============================================================== */}
        <div className="relative z-30 max-w-xl w-[92%] sm:w-[90%] mx-auto text-center px-4 py-12 sm:py-8 my-auto">
          {/* Large 3D MiniKitchen Logo with Subtle Entrance Animation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center mb-5 sm:mb-6"
          >
            <div className="relative group">
              {/* Golden Ambient Halo */}
              <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-[#F5B82E]/35 via-[#D4A43C]/25 to-[#F5B82E]/35 blur-2xl opacity-80" />
              <img
                src={OFFICIAL_LOGO_URL}
                alt="MiniKitchen Official 3D Logo"
                className="relative w-36 sm:w-56 h-auto object-contain mx-auto filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]"
              />
            </div>
          </motion.div>

          {/* Heading: "Welcome to MiniKitchen" */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-serif text-3xl sm:text-5xl lg:text-[54px] font-bold text-white tracking-tight leading-[1.12] mb-2"
          >
            Welcome to <span className="text-[#F5B82E]">MiniKitchen</span>
          </motion.h1>

          {/* Tagline: "Good Food, Great Moments." */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="font-serif italic text-base sm:text-xl text-[#D4A43C] mb-3 sm:mb-4"
          >
            Good Food, Great Moments.
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-stone-300 text-xs sm:text-base font-light leading-relaxed max-w-md mx-auto mb-7 sm:mb-8"
          >
            Discover delicious flavors, explore our menu, and reserve your perfect dining experience.
          </motion.p>

          {/* Dual Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-sm sm:max-w-md mx-auto"
          >
            {/* Primary Button: "Explore MiniKitchen" -> Home */}
            <button
              onClick={onExplore}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#F5B82E] to-[#D4A43C] hover:from-[#eab12b] hover:to-[#c6942c] text-[#0D0D0D] font-bold text-sm sm:text-base shadow-xl shadow-[#D4A43C]/25 transition-all duration-300 active:scale-[0.98] cursor-pointer"
            >
              <span>Explore MiniKitchen</span>
              <ArrowRight className="w-4 h-4 text-[#0D0D0D]" />
            </button>

            {/* Secondary Button: "Reserve a Table" -> Reservations */}
            <button
              onClick={onReserve}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 rounded-xl bg-[#171717]/85 hover:bg-[#202020] text-white border border-[#D4A43C] font-semibold text-sm sm:text-base shadow-lg transition-all duration-300 active:scale-[0.98] cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#D4A43C]" />
              <span>Reserve a Table</span>
            </button>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
