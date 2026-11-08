import React from 'react';
import { HeroSection } from '../components/HeroSection';
import { RestaurantInfo } from '../components/RestaurantInfo';
import { PopularDishes } from '../components/PopularDishes';
import { ReserveBanner } from '../components/ReserveBanner';
import { Footer } from '../components/Footer';
import { MenuItemData } from '../data/demoMenu';

interface HomeProps {
  popularMenuData: MenuItemData[];
  onOpenAdmin: () => void;
  onOpenChat: () => void;
  onNavigateMenu: () => void;
  onNavigateReserve: () => void;
  onNavigateContact?: () => void;
  onNavigate?: (page: 'home' | 'menu' | 'reserve' | 'contact') => void;
  onReplayWelcome?: () => void;
}

export const Home: React.FC<HomeProps> = ({
  popularMenuData,
  onOpenAdmin,
  onOpenChat,
  onNavigateMenu,
  onNavigateReserve,
  onNavigate,
  onReplayWelcome,
}) => {
  const featuredDish =
    popularMenuData.find((item) =>
      item.isAvailable &&
      item.image &&
      !item.image.startsWith('/public/') &&
      item.dietaryTags?.includes("Chef's Special")
    ) ??
    popularMenuData.find((item) => item.isAvailable && item.image && !item.image.startsWith('/public/'));

  return (
    <div className="flex flex-col min-h-screen bg-[#0D0D0D]">
      {/* 1. Hero Section: Panoramic dark restaurant with high-res steak, typography, and floating food cards */}
      <HeroSection
        onReserveClick={onNavigateReserve}
        onMenuClick={onNavigateMenu}
        featuredDish={featuredDish}
      />

      {/* 2. Restaurant Information Bar: Floating panel overlapping hero */}
      <RestaurantInfo
        openingHours="Mon – Sun | 11:00 AM – 10:00 PM"
        phone="+94 76 673 7844"
        location="Colombo, Sri Lanka"
      />

      {/* 3. Popular Dishes Section: #FFF8EB cream background with 4 cards and carousel */}
      <PopularDishes items={popularMenuData} />

      {/* 4. Promotional Reserve Your Table Banner with Book Now button */}
      <ReserveBanner onBookNow={onNavigateReserve} />

      {/* 5. Footer: Dark #0D0D0D with MiniKitchen branding */}
      <Footer
        onOpenAdmin={onOpenAdmin}
        onOpenChat={onOpenChat}
        onNavigate={onNavigate}
        onReplayWelcome={onReplayWelcome}
      />
    </div>
  );
};
