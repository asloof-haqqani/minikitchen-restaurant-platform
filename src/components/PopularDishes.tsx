import React, { useEffect, useRef, useState } from 'react';
import { MenuItemData } from '../data/demoMenu';
import { FoodCard } from './FoodCard';
import { ChevronLeft, ChevronRight, Coffee, Pizza, Soup } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

interface PopularDishesProps {
  items: MenuItemData[];
}

export const PopularDishes: React.FC<PopularDishesProps> = ({ items }) => {
  // Ensure we display the four core popular dishes or filtered items
  const displayItems = items.slice(0, 6);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const shouldReduceMotion = useReducedMotion();

  // Show four dishes at a time, advancing one dish per slide.
  const maxSlides = Math.max(1, displayItems.length - 3);

  useEffect(() => {
    if (shouldReduceMotion || isPaused || maxSlides < 2) return;

    const timer = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % maxSlides);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [isPaused, maxSlides, shouldReduceMotion]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : maxSlides - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < maxSlides - 1 ? prev + 1 : 0));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      // Swiped left
      handleNext();
    }
    if (touchStartX.current - touchEndX.current < -50) {
      // Swiped right
      handlePrev();
    }
  };

  const handleCarouselBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsPaused(false);
    }
  };

  return (
    <section className="pt-20 pb-24 bg-[#FFF8EB] text-[#0D0D0D] border-b border-[#F5E8D8] relative">
      {!shouldReduceMotion && (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
          {[
            { Icon: Soup, className: 'left-[3%] top-[25%]', delay: 0 },
            { Icon: Pizza, className: 'right-[4%] top-[42%]', delay: 1.2 },
            { Icon: Coffee, className: 'left-[8%] bottom-[14%]', delay: 2.1 },
          ].map(({ Icon, className, delay }, index) => (
            <motion.div
              key={index}
              className={`absolute ${className} text-[#C99835]/20`}
              animate={{ y: [0, -9, 0], rotate: [0, index % 2 ? 4 : -4, 0] }}
              transition={{ duration: 5 + index, delay, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Icon className="h-7 w-7 sm:h-9 sm:w-9" strokeWidth={1.4} />
            </motion.div>
          ))}
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Elegant Section Title */}
        <div className="text-center mb-12 sm:mb-14">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#0D0D0D] tracking-tight">
            Our Popular Dishes
          </h2>
          {/* Short Gold Underline */}
          <div className="w-16 h-[2.5px] bg-[#D4A43C] rounded-full mx-auto mt-3" />
        </div>

        {/* Carousel Container */}
        <div
          className="relative"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocusCapture={() => setIsPaused(true)}
          onBlurCapture={handleCarouselBlur}
        >
          {/* Arrow Buttons (Desktop & Tablet) */}
          <div className="hidden lg:flex items-center justify-between absolute -left-5 -right-5 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <button
              onClick={handlePrev}
              className="pointer-events-auto w-11 h-11 rounded-full bg-white/90 hover:bg-white border border-[#F5E8D8] text-[#0D0D0D] shadow-md flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 hover:border-[#D4A43C]"
              aria-label="Previous dishes"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={handleNext}
              className="pointer-events-auto w-11 h-11 rounded-full bg-white/90 hover:bg-white border border-[#F5E8D8] text-[#0D0D0D] shadow-md flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 hover:border-[#D4A43C]"
              aria-label="Next dishes"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Food Cards Grid (Desktop displays 4 in a horizontal row) */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentIndex}
              initial={shouldReduceMotion ? false : { opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, x: -28 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: 'easeOut' }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6"
            >
              {Array.from({ length: Math.min(4, displayItems.length) }, (_, i) => {
                const item = displayItems[(currentIndex + i) % displayItems.length];
                return <FoodCard key={item.id} item={item} />;
              })}
            </motion.div>
          </AnimatePresence>

          {/* Carousel Pagination Indicators */}
          <div className="flex items-center justify-center gap-2 mt-10">
            {Array.from({ length: maxSlides }, (_, dot) => (
              <button
                key={dot}
                onClick={() => setCurrentIndex(dot)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === dot
                    ? 'w-7 bg-[#D4A43C]'
                    : 'w-2 bg-[#F5E8D8] hover:bg-[#D4A43C]/50'
                }`}
                aria-label={`Go to slide ${dot + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
