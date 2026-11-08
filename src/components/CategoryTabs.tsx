import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  LayoutGrid,
  Utensils,
  Flame,
  Layers,
  Sparkles,
  CupSoda,
  Cookie,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// Custom Burger Icon matching the exact outline from mockup (image_73696b8e.png)
const BurgerIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.1"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Upper Bun */}
    <path d="M4 10.5C4 6.5 7.5 4 12 4s8 2.5 8 6.5H4z" />
    {/* Center Patty / Filling Layer */}
    <path d="M4 14h16" />
    {/* Lower Bun */}
    <path d="M5 17.5c0 2 3.1 2.5 7 2.5s7-.5 7-2.5H5z" />
  </svg>
);

export interface CategoryItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const CATEGORIES: CategoryItem[] = [
  { id: 'all', name: 'All', icon: LayoutGrid },
  { id: 'burgers', name: 'Burgers', icon: BurgerIcon },
  { id: 'pasta', name: 'Pasta', icon: Utensils },
  { id: 'chicken', name: 'Chicken', icon: Flame },
  { id: 'wraps', name: 'Wraps', icon: Layers },
  { id: 'sides', name: 'Sides', icon: Sparkles },
  { id: 'drinks', name: 'Drinks', icon: CupSoda },
  { id: 'desserts', name: 'Desserts', icon: Cookie },
];

interface CategoryTabsProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activePageIndex, setActivePageIndex] = useState(0);

  // Check scroll bounds for edge fade masks and arrows
  const checkScrollBounds = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);

    // Calculate approximate page (0 to 1) for pagination indicator
    if (clientWidth > 0) {
      const page = Math.round(scrollLeft / (clientWidth * 0.7));
      setActivePageIndex(Math.min(page, 1));
    }
  };

  useEffect(() => {
    checkScrollBounds();
    window.addEventListener('resize', checkScrollBounds);
    return () => window.removeEventListener('resize', checkScrollBounds);
  }, []);

  // Center active category into view when changed
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const activeBtn = el.querySelector<HTMLButtonElement>(`[data-category-id="${selectedCategory.toLowerCase()}"]`);
    if (activeBtn) {
      const containerLeft = el.getBoundingClientRect().left;
      const btnLeft = activeBtn.getBoundingClientRect().left;
      const offset = btnLeft - containerLeft - el.clientWidth / 2 + activeBtn.clientWidth / 2;
      el.scrollBy({ left: offset, behavior: 'smooth' });
    }
    // Re-check after animation
    const timer = setTimeout(checkScrollBounds, 300);
    return () => clearTimeout(timer);
  }, [selectedCategory]);

  const scrollByAmount = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const amount = direction === 'left' ? -260 : 260;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <div className="relative -mt-9 sm:-mt-11 z-30 w-full min-w-0 max-w-5xl mx-auto px-3 sm:px-6">
      {/* Dark floating container matching mockup with rounded corners and gold glow */}
      <div className="w-full min-w-0 bg-[#141414] border border-[#262626] rounded-2xl sm:rounded-3xl p-2 sm:p-2.5 shadow-2xl shadow-black/80 relative overflow-hidden">
        
        {/* Subtle Left Fade Gradient Mask when scrolled (Mobile/Tablet) */}
        {canScrollLeft && (
          <div className="md:hidden absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#141414] to-transparent z-10 pointer-events-none" />
        )}

        {/* Subtle Right Fade Gradient Mask when more content exists (Mobile/Tablet) */}
        {canScrollRight && (
          <div className="md:hidden absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#141414] to-transparent z-10 pointer-events-none" />
        )}

        {/* Categories Track: Smooth swipe/scroll on mobile/tablet, centered grid/flex on desktop */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollBounds}
          className="w-full min-w-0 flex md:justify-center items-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1 touch-pan-x"
        >
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory.toLowerCase() === cat.id.toLowerCase();

            return (
              <button
                key={cat.id}
                data-category-id={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                aria-pressed={isActive}
                className={`relative flex flex-col items-center justify-center shrink-0 w-[78px] sm:w-[86px] lg:w-[98px] h-[74px] sm:h-[84px] lg:h-[90px] rounded-2xl transition-all duration-200 cursor-pointer select-none ${
                  isActive
                    ? 'text-[#121212] font-bold shadow-lg shadow-[#F5B82E]/30 scale-[1.02]'
                    : 'bg-[#1C1C1C] hover:bg-[#252525] active:bg-[#202020] text-white border border-white/5 font-semibold'
                }`}
                aria-label={`Filter by ${cat.name}`}
              >
                {isActive && (
                  <motion.span
                    layoutId="activeMenuCategory"
                    className="absolute inset-0 rounded-2xl bg-[#F5B82E]"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    aria-hidden="true"
                  />
                )}
                <div
                  className={`relative z-10 w-6 h-6 flex items-center justify-center transition-transform ${
                    isActive ? 'text-[#121212]' : 'text-[#F5B82E]'
                  }`}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
                </div>
                <span
                  className={`relative z-10 text-xs sm:text-sm tracking-wide ${
                    isActive ? 'font-bold text-[#121212]' : 'font-medium text-white'
                  }`}
                >
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Mobile Navigation Controls & Visual Indicator (< md) */}
        <div className="md:hidden flex items-center justify-between px-2 pt-2 border-t border-white/5 mt-1 text-[11px] text-stone-400">
          <button
            onClick={() => scrollByAmount('left')}
            disabled={!canScrollLeft}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg transition-colors cursor-pointer ${
              canScrollLeft
                ? 'text-[#F5B82E] hover:bg-white/5 active:bg-white/10'
                : 'text-stone-600 opacity-40 cursor-default'
            }`}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>

          {/* Center Category Indicator */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-stone-400">
              8 Categories
            </span>
            <span className="text-stone-600">•</span>
            <div className="flex items-center gap-1">
              <span
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  !canScrollLeft ? 'w-4 bg-[#F5B82E]' : 'bg-stone-600'
                }`}
              />
              <span
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  canScrollLeft && canScrollRight ? 'w-4 bg-[#F5B82E]' : 'bg-stone-600'
                }`}
              />
              <span
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  !canScrollRight ? 'w-4 bg-[#F5B82E]' : 'bg-stone-600'
                }`}
              />
            </div>
          </div>

          <button
            onClick={() => scrollByAmount('right')}
            disabled={!canScrollRight}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg transition-colors cursor-pointer ${
              canScrollRight
                ? 'text-[#F5B82E] hover:bg-white/5 active:bg-white/10'
                : 'text-stone-600 opacity-40 cursor-default'
            }`}
            aria-label="Scroll right"
          >
            <span>More</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
