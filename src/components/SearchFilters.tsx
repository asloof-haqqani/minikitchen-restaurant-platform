import React from 'react';
import { Search, ChevronDown, Filter } from 'lucide-react';

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  availabilityFilter: 'all' | 'available' | 'unavailable';
  onAvailabilityChange: (filter: 'all' | 'available' | 'unavailable') => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchQuery,
  onSearchChange,
  availabilityFilter,
  onAvailabilityChange,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-6 pt-6 sm:pt-10 pb-4 sm:pb-6">
      <div className="flex items-center gap-2 sm:gap-4 justify-between">
        {/* Search Input Bar with pill rounded styling */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 sm:pl-11 pr-8 sm:pr-10 py-3 rounded-full bg-white border border-[#E8DED3]/80 text-stone-900 placeholder:text-stone-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A43C] shadow-sm transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs text-stone-400 hover:text-stone-700 bg-stone-100 hover:bg-stone-200 px-2 py-0.5 rounded-full cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Availability Filter - On Mobile: filter icon button matching mockup; On Desktop: dropdown select */}
        <div className="relative shrink-0">
          {/* Mobile Filter Button */}
          <div className="sm:hidden relative">
            <select
              value={availabilityFilter}
              onChange={(e) =>
                onAvailabilityChange(e.target.value as 'all' | 'available' | 'unavailable')
              }
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              aria-label="Filter availability"
            >
              <option value="all">Availability: All</option>
              <option value="available">Available Only</option>
              <option value="unavailable">Not Available Only</option>
            </select>
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center border shadow-sm transition-colors cursor-pointer ${
                availabilityFilter !== 'all'
                  ? 'bg-gradient-to-r from-[#F5B82E] to-[#D4A43C] text-[#0D0D0D] border-[#D4A43C]'
                  : 'bg-white text-stone-700 border-[#E8DED3]/80'
              }`}
            >
              <Filter className="w-4 h-4 stroke-[2]" />
            </div>
          </div>

          {/* Desktop Select Dropdown */}
          <div className="hidden sm:block relative">
            <select
              value={availabilityFilter}
              onChange={(e) =>
                onAvailabilityChange(e.target.value as 'all' | 'available' | 'unavailable')
              }
              className="w-48 appearance-none pl-4 pr-10 py-3 rounded-full bg-white border border-[#E8DED3] text-stone-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#D4A43C] shadow-sm cursor-pointer"
            >
              <option value="all">Availability: All</option>
              <option value="available">Available Only</option>
              <option value="unavailable">Not Available Only</option>
            </select>
            <ChevronDown className="w-4 h-4 text-stone-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};
