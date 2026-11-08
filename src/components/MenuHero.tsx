import React from 'react';
import { motion } from 'motion/react';
import { GoldFlickers } from './GoldFlickers';
import { restaurantImageUrl } from '../utils/restaurantImage';

export const MenuHero: React.FC = () => {
  return (
    <section className="relative w-full bg-[#0D0D0D] overflow-hidden pt-6 pb-16 lg:pb-20">
      {/* Background with Dark Slate Steak Image */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src={restaurantImageUrl('/src/assets/images/hero_steak_bg_1793946373904.jpg')}
          alt="MiniKitchen Menu culinary backdrop with sizzling steak"
          className="w-full h-full object-cover object-right lg:object-center opacity-80"
        />
        {/* Left-to-Right Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0D] via-[#0D0D0D]/90 sm:via-[#0D0D0D]/75 md:via-[#0D0D0D]/55 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0D0D0D] to-transparent pointer-events-none" />
      </div>
      <GoldFlickers />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-2xl">
          {/* Headline: Our Menu */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-3"
          >
            Our <span className="text-[#F5B82E]">Menu</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="text-stone-300 text-sm sm:text-base lg:text-lg max-w-lg leading-relaxed font-sans font-light"
          >
            A delicious selection of your favorites, freshly prepared at MiniKitchen.
          </motion.p>
        </div>
      </div>
    </section>
  );
};
