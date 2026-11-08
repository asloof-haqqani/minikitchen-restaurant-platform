import React from 'react';
import { MapPin, Navigation, Clock } from 'lucide-react';
import { RESTAURANT_INFO } from '../config/restaurantInfo';

export const LocationSection: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
        {/* Left: Colombo Sri Lanka Location Map Card */}
        <div className="relative rounded-3xl overflow-hidden border border-stone-800 bg-[#171717] min-h-[300px] sm:min-h-[360px] shadow-2xl flex flex-col justify-between group">
          {/* Real styled map iframe */}
          <iframe
            title="MiniKitchen Colombo Location Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63371.80392765383!2d79.82118608826065!3d6.921837349141753!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae253d10f7a7003%3A0x320b2e4d32d3838d!2sColombo%2C%20Sri%20Lanka!5e0!3m2!1sen!2slk!4v1700000000000!5m2!1sen!2slk"
            className="w-full h-full min-h-[300px] border-0 filter contrast-[1.05] opacity-90 group-hover:opacity-100 transition-opacity"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />

          {/* Floating Location Overlay Badge matching mockup */}
          <div className="absolute top-4 left-4 z-10 p-3 sm:p-4 rounded-2xl bg-[#0D0D0D]/90 backdrop-blur-md border border-[#D4A43C]/40 text-white shadow-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shrink-0 shadow-md">
              <MapPin className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h5 className="font-bold text-sm text-white">MiniKitchen</h5>
              <p className="text-xs text-stone-300">Colombo, Sri Lanka</p>
            </div>
          </div>
        </div>

        {/* Right: Restaurant Exterior / Storefront Evening Photograph */}
        <div className="relative rounded-3xl overflow-hidden border border-stone-800 bg-[#171717] min-h-[300px] sm:min-h-[360px] shadow-2xl group">
          <img
            src="/src/assets/images/restaurant_entrance_1793980636853.jpg"
            alt="MiniKitchen exterior dining entrance in Colombo with glowing evening lights"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/80 via-transparent to-transparent pointer-events-none" />

          {/* Bottom badge */}
          <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-[#0D0D0D]/80 backdrop-blur-md border border-[#D4A43C]/30 text-white">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-white">
              <Navigation className="w-4 h-4 text-[#D4A43C]" />
              <span>MiniKitchen Entrance &amp; Patio</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-stone-300">
              <Clock className="w-3.5 h-3.5 text-[#D4A43C]" />
              <span>Open 11:00 AM – 10:00 PM</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
