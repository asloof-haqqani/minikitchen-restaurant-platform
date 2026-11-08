import React, { useState, useMemo } from 'react';
import { MenuHero } from '../components/MenuHero';
import { CategoryTabs } from '../components/CategoryTabs';
import { SearchFilters } from '../components/SearchFilters';
import { MenuList } from '../components/MenuList';
import { Footer } from '../components/Footer';
import { MenuItemData } from '../data/demoMenu';

interface MenuPageProps {
  menuItems: MenuItemData[];
  loading: boolean;
  onRefresh?: () => void;
  onOpenAdmin: () => void;
  onOpenChat: () => void;
  onNavigate?: (page: 'home' | 'menu' | 'reserve' | 'contact') => void;
}

export const Menu: React.FC<MenuPageProps> = ({
  menuItems,
  loading,
  onRefresh,
  onOpenAdmin,
  onOpenChat,
  onNavigate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'unavailable'>('all');

  // Filter items by category, search text, and availability
  const filteredDishes = useMemo(() => {
    return menuItems.filter((item) => {
      // 1. Category filter
      const matchesCategory =
        selectedCategory === 'all' ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();

      // 2. Search filter
      const matchesSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());

      // 3. Availability filter
      let matchesAvailability = true;
      if (availabilityFilter === 'available') {
        matchesAvailability = item.isAvailable === true;
      } else if (availabilityFilter === 'unavailable') {
        matchesAvailability = item.isAvailable === false;
      }

      return matchesCategory && matchesSearch && matchesAvailability;
    });
  }, [menuItems, selectedCategory, searchQuery, availabilityFilter]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setAvailabilityFilter('all');
    if (onRefresh) onRefresh();
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF8EB] text-stone-900">
      {/* 1. Dark Cinematic Menu Hero with steak photo */}
      <MenuHero />

      {/* 2. Floating Category Navigation Bar with Gold Icons */}
      <CategoryTabs
        selectedCategory={selectedCategory}
        onSelectCategory={(catId) => setSelectedCategory(catId)}
      />

      {/* 3. Search and Availability Filter Bar */}
      <SearchFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        availabilityFilter={availabilityFilter}
        onAvailabilityChange={setAvailabilityFilter}
      />

      {/* 4. Menu Dishes List grouped by category or filtered */}
      <div className="flex-1 pb-20">
        <MenuList
          items={filteredDishes}
          selectedCategory={selectedCategory}
          onSelectCategory={(catId) => setSelectedCategory(catId)}
          loading={loading}
          onRetry={handleResetFilters}
        />
      </div>

      {/* 5. Footer */}
      <Footer onOpenAdmin={onOpenAdmin} onOpenChat={onOpenChat} onNavigate={onNavigate} />
    </div>
  );
};
