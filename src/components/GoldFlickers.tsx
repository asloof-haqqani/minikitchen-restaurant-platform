import React from 'react';
import { Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

const FLICKERS = [
  { left: '57%', top: '19%', size: 5, delay: 0 },
  { left: '70%', top: '69%', size: 4, delay: 0.8 },
  { left: '82%', top: '24%', size: 6, delay: 1.5 },
  { left: '91%', top: '55%', size: 4, delay: 0.4 },
  { left: '62%', top: '80%', size: 5, delay: 1.1 },
  { left: '96%', top: '17%', size: 4, delay: 2 },
  { left: '43%', top: '47%', size: 4, delay: 2.6 },
];

const GLINTS = [
  { left: '75%', top: '36%', size: 16, delay: 0.3 },
  { left: '94%', top: '75%', size: 13, delay: 1.2 },
  { left: '54%', top: '61%', size: 12, delay: 2.1 },
];

export const GoldFlickers: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  if (shouldReduceMotion) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden" aria-hidden="true">
      {FLICKERS.map((flicker, index) => (
        <motion.span
          key={index}
          className="absolute rounded-full bg-[#FFE08A] shadow-[0_0_14px_4px_rgba(245,184,46,0.8)]"
          style={{
            left: flicker.left,
            top: flicker.top,
            width: flicker.size,
            height: flicker.size,
          }}
          animate={{
            opacity: [0.2, 1, 0.3, 0.9, 0.2],
            y: [0, -10, -3, 7, 0],
            scale: [0.7, 1.35, 0.8, 1.2, 0.7],
          }}
          transition={{
            duration: 3.2 + (index % 3) * 0.45,
            delay: flicker.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
      {GLINTS.map((glint, index) => (
        <motion.span
          key={`glint-${index}`}
          className="absolute text-[#FFE08A] drop-shadow-[0_0_12px_rgba(245,184,46,0.95)]"
          style={{ left: glint.left, top: glint.top }}
          animate={{
            opacity: [0.15, 1, 0.2],
            scale: [0.65, 1.2, 0.65],
            rotate: [0, 25, 0],
          }}
          transition={{
            duration: 2.5,
            delay: glint.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Sparkles style={{ width: glint.size, height: glint.size }} strokeWidth={2.2} />
        </motion.span>
      ))}
    </div>
  );
};
