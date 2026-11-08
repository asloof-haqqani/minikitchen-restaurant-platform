import React, { useState } from 'react';
import { MenuItemData } from '../data/demoMenu';
import { Heart, Utensils } from 'lucide-react';
import { motion } from 'motion/react';

interface MenuCardProps {
  item: MenuItemData;
}

export const MenuCard: React.FC<MenuCardProps> = ({ item }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-[#E8DED3] flex flex-row sm:flex-col group transition-all duration-300 p-3 sm:p-0 gap-3.5 sm:gap-0 hover:border-[#D4A43C]/60"
    >
      {/* Food Photo Container - Square on mobile, 16/10 on desktop */}
      <div className="relative w-24 h-24 sm:w-full sm:h-auto sm:aspect-[16/10] shrink-0 rounded-xl sm:rounded-none bg-[#171717] overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-stone-100">
            <Utensils className="w-8 h-8 text-stone-300" />
          </div>
        )}

        {/* Favorite Heart Button on desktop (top-right of image) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className={`hidden sm:flex absolute top-3 right-3 w-8 h-8 rounded-full items-center justify-center backdrop-blur-md transition-all duration-200 ${
            isFavorite
              ? 'bg-rose-50 text-rose-500 shadow-md scale-110'
              : 'bg-black/40 text-white/90 hover:bg-black/60 hover:text-white'
          }`}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className={`w-4 h-4 transition-transform ${
              isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white'
            }`}
          />
        </button>

        {/* Dietary Tag if available (Desktop) */}
        {item.dietaryTags && item.dietaryTags.length > 0 && (
          <div className="absolute top-2.5 left-2.5 hidden sm:block">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#0D0D0D]/80 backdrop-blur-sm text-[#D4A43C] border border-[#D4A43C]/40">
              {item.dietaryTags[0]}
            </span>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="flex-1 flex flex-col justify-between min-w-0 sm:p-5 sm:space-y-3 bg-white">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-sans text-sm sm:text-lg font-bold text-[#0D0D0D] tracking-tight truncate sm:whitespace-normal">
              {item.name}
            </h3>

            {/* Favorite Heart Button on mobile */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFavorite(!isFavorite);
              }}
              className="sm:hidden p-1 text-stone-400 hover:text-rose-500 transition-colors shrink-0"
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                className={`w-4 h-4 ${
                  isFavorite ? 'fill-rose-500 text-rose-500' : 'text-stone-400'
                }`}
              />
            </button>
          </div>

          <p className="text-stone-500 text-[11px] sm:text-xs line-clamp-2 mt-0.5 sm:mt-1 leading-relaxed">
            {item.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-1 sm:pt-2 sm:border-t sm:border-stone-100 gap-2 mt-2 sm:mt-0">
          <span className="font-sans text-xs sm:text-base font-bold text-[#0D0D0D] shrink-0">
            Rs. {item.price.toLocaleString()}
          </span>

          {/* Availability Badge */}
          {item.isAvailable ? (
            <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-[#d7f5df] text-[#1c7b3e] border border-[#a8e6a1]/60 whitespace-nowrap">
              Available
            </span>
          ) : (
            <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-[#fde2e2] text-[#d63031] border border-[#f4a3a3]/60 whitespace-nowrap">
              Not Available
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
