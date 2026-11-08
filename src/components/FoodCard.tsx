import React from 'react';
import { MenuItemData } from '../data/demoMenu';
import { Utensils } from 'lucide-react';
import { motion } from 'motion/react';

interface FoodCardProps {
  item: MenuItemData;
}

export const FoodCard: React.FC<FoodCardProps> = ({ item }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-[#F5E8D8] flex flex-col group transition-all duration-300 hover:border-[#D4A43C]/60"
    >
      {/* Food Photo Container */}
      <div className="relative aspect-[16/10] bg-[#171717] overflow-hidden">
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

        {/* Dietary Tag if available */}
        {item.dietaryTags && item.dietaryTags.length > 0 && (
          <div className="absolute top-2.5 left-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#0D0D0D]/80 backdrop-blur-sm text-[#D4A43C] border border-[#D4A43C]/40">
              {item.dietaryTags[0]}
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 bg-white">
        <div>
          <h3 className="font-sans text-base sm:text-lg font-bold text-[#0D0D0D] tracking-tight">
            {item.name}
          </h3>
          <p className="text-stone-500 text-xs line-clamp-2 mt-1 leading-relaxed">
            {item.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-stone-100">
          <span className="font-sans text-sm sm:text-base font-bold text-[#0D0D0D]">
            Rs. {item.price.toLocaleString()}
          </span>

          {/* Availability Badge */}
          {item.isAvailable ? (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#e6f7ec] text-[#1b7a3e] border border-[#A8E6A1]/60">
              Available
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#fde8e8] text-[#c81e1e] border border-[#F4A3A3]/60">
              Not Available
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
