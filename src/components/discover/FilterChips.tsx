'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, DollarSign, Home, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import FilterSheet from './FilterSheet';
import UniversityFilter from './filters/UniversityFilter';
import PriceFilter from './filters/PriceFilter';
import RoomTypeFilter from './filters/RoomTypeFilter';
import AmenitiesFilter from './filters/AmenitiesFilter';
import type { Filters } from '@/lib/filterListings';
import { defaultFilters } from '@/lib/filterListings';
import { universities } from '@/data/mockData';
import { formatNaira } from '@/lib/utils';

interface FilterChipsProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

type FilterType = 'university' | 'price' | 'roomType' | 'amenities';

interface ChipConfig {
  id: FilterType;
  label: string;
  icon: typeof GraduationCap;
  getActiveLabel: (filters: Filters) => string | null;
  getCount: (filters: Filters) => number;
}

const chipConfigs: ChipConfig[] = [
  {
    id: 'university',
    label: 'University',
    icon: GraduationCap,
    getActiveLabel: (f) => {
      if (!f.university) return null;
      const uni = universities.find((u) => u.id === f.university);
      return uni?.shortName || null;
    },
    getCount: (f) => f.university ? 1 : 0,
  },
  {
    id: 'price',
    label: 'Price',
    icon: DollarSign,
    getActiveLabel: (f) => {
      if (f.priceRange[0] === 0 && f.priceRange[1] === 1000000) return null;
      return `${formatNaira(f.priceRange[0])} – ${formatNaira(f.priceRange[1])}`;
    },
    getCount: (f) => (f.priceRange[0] > 0 || f.priceRange[1] < 1000000) ? 1 : 0,
  },
  {
    id: 'roomType',
    label: 'Room Type',
    icon: Home,
    getActiveLabel: (f) => f.roomTypes.length > 0 ? `${f.roomTypes.length} selected` : null,
    getCount: (f) => f.roomTypes.length,
  },
  {
    id: 'amenities',
    label: 'Amenities',
    icon: Sparkles,
    getActiveLabel: (f) => f.amenities.length > 0 ? `${f.amenities.length} selected` : null,
    getCount: (f) => f.amenities.length,
  },
];

export default function FilterChips({ filters, onFiltersChange }: FilterChipsProps) {
  const [activeSheet, setActiveSheet] = useState<FilterType | null>(null);
  const [pendingFilters, setPendingFilters] = useState<Filters>(filters);

  // Sort chips so active ones float to front
  const sortedChips = [...chipConfigs].sort((a, b) => {
    const aActive = a.getCount(filters) > 0 ? 1 : 0;
    const bActive = b.getCount(filters) > 0 ? 1 : 0;
    return bActive - aActive;
  });

  const openSheet = (type: FilterType) => {
    setPendingFilters({ ...filters });
    setActiveSheet(type);
  };

  const handleApply = () => {
    onFiltersChange(pendingFilters);
  };

  const handleClear = () => {
    const cleared = { ...pendingFilters };
    switch (activeSheet) {
      case 'university':
        cleared.university = null;
        break;
      case 'price':
        cleared.priceRange = [0, 1000000];
        break;
      case 'roomType':
        cleared.roomTypes = [];
        break;
      case 'amenities':
        cleared.amenities = [];
        break;
    }
    setPendingFilters(cleared);
    onFiltersChange(cleared);
  };

  const totalActive = chipConfigs.reduce((sum, c) => sum + (c.getCount(filters) > 0 ? 1 : 0), 0);

  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {/* Clear all button (if filters are active) */}
        <AnimatePresence>
          {totalActive > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, width: 0 }}
              animate={{ opacity: 1, scale: 1, width: 'auto' }}
              exit={{ opacity: 0, scale: 0.8, width: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => onFiltersChange(defaultFilters)}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-full text-xs font-medium bg-cn-coral/10 text-cn-coral border border-cn-coral/20 whitespace-nowrap shrink-0"
            >
              <X className="w-3 h-3" />
              Clear all
            </motion.button>
          )}
        </AnimatePresence>

        {sortedChips.map((chip) => {
          const Icon = chip.icon;
          const count = chip.getCount(filters);
          const isActive = count > 0;
          const activeLabel = chip.getActiveLabel(filters);

          return (
            <motion.button
              key={chip.id}
              layout
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => openSheet(chip.id)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-all border',
                isActive
                  ? 'bg-cn-purple/10 text-cn-purple border-cn-purple/20'
                  : 'glass text-text-secondary border-transparent hover:text-text-primary'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{activeLabel || chip.label}</span>
              {count > 0 && chip.id !== 'university' && chip.id !== 'price' && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center justify-center w-4 h-4 rounded-full gradient-bg text-white text-[10px] font-bold"
                >
                  {count}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Filter Sheets */}
      <FilterSheet
        isOpen={activeSheet === 'university'}
        onClose={() => setActiveSheet(null)}
        title="Select University"
        onApply={handleApply}
        onClear={handleClear}
      >
        <UniversityFilter
          selected={pendingFilters.university}
          onChange={(id) => setPendingFilters((p) => ({ ...p, university: id }))}
        />
      </FilterSheet>

      <FilterSheet
        isOpen={activeSheet === 'price'}
        onClose={() => setActiveSheet(null)}
        title="Price Range"
        onApply={handleApply}
        onClear={handleClear}
      >
        <PriceFilter
          range={pendingFilters.priceRange}
          onChange={(range) => setPendingFilters((p) => ({ ...p, priceRange: range }))}
        />
      </FilterSheet>

      <FilterSheet
        isOpen={activeSheet === 'roomType'}
        onClose={() => setActiveSheet(null)}
        title="Room Type"
        onApply={handleApply}
        onClear={handleClear}
      >
        <RoomTypeFilter
          selected={pendingFilters.roomTypes}
          onChange={(types) => setPendingFilters((p) => ({ ...p, roomTypes: types }))}
        />
      </FilterSheet>

      <FilterSheet
        isOpen={activeSheet === 'amenities'}
        onClose={() => setActiveSheet(null)}
        title="Amenities"
        onApply={handleApply}
        onClear={handleClear}
      >
        <AmenitiesFilter
          selected={pendingFilters.amenities}
          onChange={(amenities) => setPendingFilters((p) => ({ ...p, amenities }))}
        />
      </FilterSheet>
    </>
  );
}
