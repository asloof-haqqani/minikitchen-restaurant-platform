import React from 'react';
import { CakeSlice, Coffee, Pizza, Soup } from 'lucide-react';

const FLOATING_FOODS = [
  { Icon: Soup, position: 'left-[3%] top-[18%]', delay: '0s' },
  { Icon: Pizza, position: 'right-[3%] top-[36%]', delay: '-2s' },
  { Icon: Coffee, position: 'left-[6%] top-[73%]', delay: '-4s' },
  { Icon: CakeSlice, position: 'right-[7%] top-[82%]', delay: '-1s' },
];

export const GlobalFoodBackdrop: React.FC = () => {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-20 overflow-hidden"
      aria-hidden="true"
    >
      {FLOATING_FOODS.map(({ Icon, position, delay }, index) => (
        <div
          key={index}
          className={`global-food-icon absolute ${position}`}
          style={{ animationDelay: delay }}
        >
          <Icon strokeWidth={1.5} />
        </div>
      ))}
    </div>
  );
};
