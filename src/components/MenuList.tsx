import React from 'react';
import { MenuItemData } from '../data/demoMenu';
import { MenuCard } from './MenuCard';
import { ArrowRight, UtensilsCrossed, RefreshCw } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface MenuListProps {
  items: MenuItemData[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  loading: boolean;
  onRetry?: () => void;
}

export const MenuList: React.FC<MenuListProps> = ({
  items,
  selectedCategory,
  onSelectCategory,
  loading,
  onRetry,
}) => {
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl overflow-hidden border border-[#E8DED3] animate-pulse"
            >
              <div className="aspect-[16/10] bg-stone-200" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-stone-200 rounded w-2/3" />
                <div className="h-3 bg-stone-200 rounded w-full" />
                <div className="h-3 bg-stone-200 rounded w-4/5" />
                <div className="flex justify-between items-center pt-3 border-t border-stone-100">
                  <div className="h-4 bg-stone-200 rounded w-16" />
                  <div className="h-6 bg-stone-200 rounded-full w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center text-stone-600 space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-[#D4A43C] flex items-center justify-center mx-auto">
          <UtensilsCrossed className="w-8 h-8" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-stone-900">
          No Dishes Found
        </h3>
        <p className="text-sm text-stone-500">
          We couldn&apos;t find any items matching your selected criteria. Try adjusting your search or category filter.
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D0D0D] text-white hover:bg-stone-800 transition-colors text-xs font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    );
  }

  // If "all" is selected, group by category matching the mockup!
  if (selectedCategory.toLowerCase() === 'all') {
    // Unique categories present in items
    const categoriesInItems = Array.from(
      new Set(items.map((item) => item.category))
    );

    return (
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8 space-y-16">
        {categoriesInItems.map((category) => {
          const categoryDishes = items.filter(
            (item) => item.category.toLowerCase() === category.toLowerCase()
          );

          if (categoryDishes.length === 0) return null;

          return (
            <div key={category} className="space-y-6">
              {/* Category Section Header with underline and View All */}
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#0D0D0D] tracking-tight">
                    {category}
                  </h3>
                  <div className="w-12 h-[2px] bg-[#D4A43C] rounded-full hidden sm:block" />
                </div>

                <button
                  onClick={() => onSelectCategory(category.toLowerCase())}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#0D0D0D] hover:text-[#D4A43C] transition-colors group cursor-pointer"
                >
                  <span>View All</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>

              {/* Grid of Dishes for this category (3 per row desktop, 2 tablet, 1 mobile) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {categoryDishes.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                    >
                      <MenuCard item={item} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Single category view
  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#0D0D0D] tracking-tight capitalize">
            {selectedCategory}
          </h3>
          <div className="w-12 h-[2px] bg-[#D4A43C] rounded-full hidden sm:block" />
        </div>
        <span className="text-xs text-stone-500 font-medium">
          Showing {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <MenuCard item={item} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
