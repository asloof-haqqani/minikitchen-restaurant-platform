import React, { useEffect, useState } from 'react';
import { Clock, Phone, MapPin } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

interface RestaurantInfoProps {
  openingHours?: string;
  phone?: string;
  location?: string;
}

export const RestaurantInfo: React.FC<RestaurantInfoProps> = ({
  openingHours = 'Mon – Sun | 11:00 AM – 10:00 PM',
  phone = '+94 76 673 7844',
  location = 'Colombo, Sri Lanka',
}) => {
  const [activeInfo, setActiveInfo] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const contactPhone = phone.replace(/\s+/g, '');
  const infoItems = [
    { title: 'Opening Hours', details: openingHours, Icon: Clock },
    { title: 'Contact Us', details: phone, Icon: Phone, href: `tel:${contactPhone}` },
    { title: 'Our Location', details: location, Icon: MapPin },
  ];

  useEffect(() => {
    if (shouldReduceMotion) return;

    const timer = window.setInterval(() => {
      setActiveInfo((current) => (current + 1) % infoItems.length);
    }, 3500);

    return () => window.clearInterval(timer);
  }, [shouldReduceMotion, infoItems.length]);

  return (
    <div className="relative -mt-16 sm:-mt-14 z-30 mx-auto w-full max-w-[360px] px-4 sm:max-w-5xl sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full rounded-none border-0 bg-transparent p-0 shadow-none md:rounded-2xl md:border md:border-[#D4A43C]/50 md:bg-[#171717]/90 md:p-5 md:shadow-2xl lg:rounded-3xl lg:p-6"
      >
        <div className="relative min-h-[112px] overflow-hidden md:hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeInfo}
              initial={shouldReduceMotion ? false : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, x: -24 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: 'easeOut' }}
              className="flex min-h-[112px] flex-col items-center justify-center gap-1.5 px-1 pb-5"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-[#D4A43C] text-[#D4A43C] sm:h-12 sm:w-12">
                {React.createElement(infoItems[activeInfo].Icon, { className: 'h-5 w-5 stroke-[2]' })}
              </div>
              <div className="w-full min-w-0 text-center">
                <span className="block text-base font-bold text-white">{infoItems[activeInfo].title}</span>
                {infoItems[activeInfo].href ? (
                  <a
                    href={infoItems[activeInfo].href}
                    className="block whitespace-nowrap text-[13px] text-stone-300 transition-colors hover:text-[#D4A43C] sm:text-sm"
                  >
                    {infoItems[activeInfo].details}
                  </a>
                ) : (
                  <span className="block whitespace-nowrap text-[13px] text-stone-300 sm:text-sm">{infoItems[activeInfo].details}</span>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-x-0 bottom-1 flex justify-center gap-1.5">
            {infoItems.map((item, index) => (
              <button
                key={item.title}
                type="button"
                onClick={() => setActiveInfo(index)}
                aria-label={`Show ${item.title}`}
                aria-current={activeInfo === index ? 'true' : undefined}
                className={`h-1.5 rounded-full transition-all ${
                  activeInfo === index ? 'w-5 bg-[#D4A43C]' : 'w-1.5 bg-stone-500'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="hidden grid-cols-1 divide-y divide-stone-800 md:grid md:grid-cols-3 md:divide-x md:divide-y-0">
          {infoItems.map(({ title, details, Icon, href }) => (
            <div key={title} className="flex min-h-[68px] items-center gap-3 px-1 py-2 sm:gap-4 sm:px-6 md:min-h-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-[#D4A43C] text-[#D4A43C]">
                <Icon className="h-5 w-5 stroke-[2]" />
              </div>
              <div className="min-w-0">
                <span className="block text-sm font-bold text-white">{title}</span>
                {href ? (
                  <a href={href} className="block text-xs text-stone-300 transition-colors hover:text-[#D4A43C]">
                    {details}
                  </a>
                ) : (
                  <span className="block text-xs text-stone-300">{details}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
