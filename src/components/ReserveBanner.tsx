import React from 'react';
import { ArrowRight, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

interface ReserveBannerProps {
  onBookNow: () => void;
}

export const ReserveBanner: React.FC<ReserveBannerProps> = ({ onBookNow }) => {
  return (
    <section className="bg-[#FFF8EB] py-14 px-4 sm:px-6 lg:px-8 border-b border-[#F5E8D8]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl bg-[#0D0D0D] border border-stone-800 overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12 items-stretch"
        >
          {/* Left: Text & CTA */}
          <div className="md:col-span-5 p-8 sm:p-12 flex flex-col justify-center">
            <h3 className="font-serif text-3xl sm:text-4xl lg:text-[40px] font-bold text-white tracking-tight leading-tight mb-3">
              Reserve Your <span className="text-[#F5B82E]">Table</span>
            </h3>
            <p className="text-stone-300 text-sm sm:text-base font-light mb-8 max-w-sm leading-relaxed">
              Plan your dining experience with us. Secure your intimate table in advance.
            </p>
            <div>
              <button
                onClick={onBookNow}
                className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#F5B82E] to-[#D4A43C] hover:from-[#eab12b] hover:to-[#c6942c] text-[#0D0D0D] font-bold text-sm sm:text-base shadow-lg shadow-[#D4A43C]/20 transition-all duration-300 active:scale-98 group cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#0D0D0D]" />
                <span>Book Now</span>
                <ArrowRight className="w-4 h-4 text-[#0D0D0D] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right: Dining Room with Glowing MiniKitchen sign */}
          <div className="md:col-span-7 relative min-h-[260px] sm:min-h-[320px]">
            <img
              src="/src/assets/images/hero_restaurant_ambiance_1793941743774.jpg"
              alt="MiniKitchen dining room ambiance"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0D] via-transparent to-transparent pointer-events-none md:block hidden" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};
