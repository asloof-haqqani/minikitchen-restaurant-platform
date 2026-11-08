import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { MenuItemData } from '../data/demoMenu';
import { GoldFlickers } from './GoldFlickers';
import { restaurantImageUrl } from '../utils/restaurantImage';

interface HeroSectionProps {
  onReserveClick?: () => void;
  onMenuClick?: () => void;
  featuredDish?: MenuItemData;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onReserveClick,
  onMenuClick,
  featuredDish,
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="home"
      className="relative w-full min-h-[540px] lg:h-[600px] bg-[#0D0D0D] overflow-hidden flex items-center"
    >
      {/* High-Resolution Background Photography: Sizzling Steak on Slate */}
      <div className="absolute inset-0 w-full h-full">
        <motion.img
          initial={{ scale: 1.04 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          src={restaurantImageUrl('/src/assets/images/hero_steak_bg_1793946373904.jpg')}
          alt="MiniKitchen juicy grilled steak on slate board with rosemary, vegetables, and steam"
          className="w-full h-full object-cover object-right lg:object-center will-change-transform"
        />

        {/* Cinematic Left-to-Right Dark Gradient Overlay for optimal readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0D] via-[#0D0D0D]/90 sm:via-[#0D0D0D]/75 md:via-[#0D0D0D]/55 to-transparent pointer-events-none" />

        {/* Top and Bottom soft vignette */}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#0D0D0D]/80 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0D0D0D] to-transparent pointer-events-none" />
      </div>

      {featuredDish?.image && (
        <div className="hero-featured-dish-float absolute right-[6%] top-[15%] z-10 hidden lg:block">
          <motion.button
            type="button"
            onClick={onMenuClick}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: shouldReduceMotion ? 0.2 : 0.6,
              delay: shouldReduceMotion ? 0 : 0.3,
              ease: 'easeOut',
            }}
            whileHover={shouldReduceMotion ? undefined : { scale: 1.015 }}
            className="w-[clamp(210px,23vw,300px)] overflow-hidden rounded-2xl border border-[#D4A43C]/50 bg-[#11100e]/85 text-left shadow-2xl shadow-black/50 backdrop-blur-md transition-colors hover:border-[#F5B82E]/80"
            aria-label={`Explore menu: ${featuredDish.name}, Rs. ${featuredDish.price.toLocaleString()}`}
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src={restaurantImageUrl(featuredDish.image)}
                alt={featuredDish.name}
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                onError={(event) => {
                  event.currentTarget.style.visibility = 'hidden';
                }}
              />
              <span className="absolute left-3 top-3 rounded-full border border-[#F5B82E]/50 bg-[#0D0D0D]/80 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-[#F5B82E]">
                {featuredDish.dietaryTags?.includes("Chef's Special") ? "Chef's Special" : 'Guest Favorite'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 p-3.5">
              <div className="min-w-0">
                <p className="truncate font-serif text-base font-semibold text-white">{featuredDish.name}</p>
                <p className="mt-0.5 text-xs font-medium text-[#F5B82E]">Rs. {featuredDish.price.toLocaleString()}</p>
              </div>
              <span className="shrink-0 rounded-full border border-[#D4A43C]/40 p-2 text-[#F5B82E]" aria-hidden="true">
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </motion.button>
        </div>
      )}

      {featuredDish?.image && (
        <div className="hero-featured-dish-float absolute right-3 top-14 z-20 w-[108px] sm:right-5 sm:top-16 sm:w-[128px] lg:hidden">
          <motion.button
            type="button"
            onClick={onMenuClick}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: shouldReduceMotion ? 0.2 : 0.5,
              delay: shouldReduceMotion ? 0 : 0.4,
              ease: 'easeOut',
            }}
            whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
            className="block w-full overflow-hidden rounded-lg border border-[#D4A43C]/60 bg-[#11100e]/90 text-left shadow-lg shadow-black/40 backdrop-blur-md"
            aria-label={`Explore menu: ${featuredDish.name}, Rs. ${featuredDish.price.toLocaleString()}`}
          >
            <div className="relative h-12 overflow-hidden sm:h-14">
              <img
                src={restaurantImageUrl(featuredDish.image)}
                alt={featuredDish.name}
                className="h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.style.visibility = 'hidden';
                }}
              />
              <span className="absolute left-1 top-1 rounded-full border border-[#F5B82E]/50 bg-[#0D0D0D]/85 px-1.5 py-0.5 text-[6px] font-bold uppercase tracking-[0.08em] text-[#F5B82E]">
                Chef&apos;s Special
              </span>
            </div>
            <div className="px-2 py-1.5">
              <p className="truncate font-serif text-[10px] font-semibold leading-tight text-white sm:text-xs">
                {featuredDish.name}
              </p>
              <p className="mt-0.5 text-[9px] font-medium leading-tight text-[#F5B82E] sm:text-[10px]">
                Rs. {featuredDish.price.toLocaleString()}
              </p>
            </div>
          </motion.button>
        </div>
      )}

      <GoldFlickers />

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 lg:py-0">
        <div className="max-w-2xl">
          {/* Small Uppercase Gold Kicker */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex items-center gap-2 mb-3 sm:mb-4"
          >
            <span className="text-[11px] sm:text-[12px] font-sans tracking-[0.25em] uppercase text-[#D4A43C] font-semibold">
              MINIKITCHEN —
            </span>
          </motion.div>

          {/* Headline with Playfair Display Serif */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="font-serif text-4xl sm:text-6xl lg:text-[72px] font-bold tracking-tight text-white leading-[1.08] mb-4 sm:mb-5"
          >
            Good Food, <br />
            <span className="text-white">Great </span>
            <span className="text-[#F5B82E]">Moments.</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="text-stone-300 text-sm sm:text-base lg:text-lg max-w-lg leading-relaxed font-sans font-light mb-7 sm:mb-8"
          >
            Freshly prepared meals, a cozy atmosphere and a table always ready for you.
          </motion.p>

          {/* Call-to-Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 max-w-sm sm:max-w-none"
          >
            {/* Primary: Reserve a Table */}
            <button
              onClick={onReserveClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#F5B82E] to-[#D4A43C] hover:from-[#f0b127] hover:to-[#c6942c] text-[#0D0D0D] font-bold text-sm sm:text-base shadow-lg shadow-[#D4A43C]/25 transition-all duration-300 active:scale-[0.98] cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#0D0D0D]" />
              <span>Reserve a Table</span>
              <ArrowRight className="w-4 h-4 text-[#0D0D0D]" />
            </button>

            {/* Secondary: View Menu */}
            <button
              onClick={onMenuClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-xl bg-[#0D0D0D]/60 hover:bg-[#171717]/80 text-white border border-[#D4A43C] font-semibold text-sm sm:text-base transition-all duration-300 active:scale-[0.98] cursor-pointer"
            >
              <span>View Menu</span>
            </button>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
