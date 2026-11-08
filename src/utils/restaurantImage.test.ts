import { describe, expect, it, vi } from 'vitest';

vi.mock('../assets/images/food_cheese_burger_1793979902653.jpg', () => ({
  default: '/assets/food_cheese_burger_1793979902653-test.jpg',
}));

import { restaurantImageUrl } from './restaurantImage';

describe('restaurantImageUrl', () => {
  it('resolves source image paths to Vite-built image assets', () => {
    const url = restaurantImageUrl('/src/assets/images/food_cheese_burger_1793979902653.jpg');

    expect(url).toBe('/assets/food_cheese_burger_1793979902653-test.jpg');
  });

  it('removes the public directory prefix from public image paths', () => {
    expect(restaurantImageUrl('/public/assets/crops/dish_burger.png')).toBe(
      '/assets/crops/dish_burger.png',
    );
  });

  it('preserves external image URLs', () => {
    expect(restaurantImageUrl('https://example.com/dish.jpg')).toBe(
      'https://example.com/dish.jpg',
    );
  });
});
