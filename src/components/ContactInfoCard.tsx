import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface ContactInfoCardProps {
  icon: LucideIcon;
  title: string;
  details: string;
  href?: string;
  delay?: number;
}

export const ContactInfoCard: React.FC<ContactInfoCardProps> = ({
  icon: Icon,
  title,
  details,
  href,
  delay = 0,
}) => {
  const content = (
    <div className="flex items-center gap-4 p-4 sm:p-5 h-[80px] rounded-2xl bg-[#171717]/90 backdrop-blur-md border border-[#D4A43C]/25 hover:border-[#D4A43C]/60 transition-all duration-300 shadow-lg group">
      {/* Gold outlined circular icon */}
      <div className="w-12 h-12 rounded-full border-2 border-[#D4A43C] flex items-center justify-center shrink-0 text-[#D4A43C] group-hover:scale-105 transition-transform duration-300">
        <Icon className="w-5 h-5 stroke-[2]" />
      </div>

      <div className="space-y-0.5 min-w-0">
        <h4 className="text-sm font-bold text-white tracking-tight">
          {title}
        </h4>
        <p className="text-xs text-stone-300 font-sans truncate">
          {details}
        </p>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
    >
      {href ? (
        <a href={href} className="block focus:outline-none">
          {content}
        </a>
      ) : (
        content
      )}
    </motion.div>
  );
};
