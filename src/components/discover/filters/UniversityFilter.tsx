'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Check, MapPin } from 'lucide-react';
import { universities } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface UniversityFilterProps {
  selected: string | null;
  onChange: (id: string | null) => void;
}

export default function UniversityFilter({ selected, onChange }: UniversityFilterProps) {
  const [search, setSearch] = useState('');

  const filtered = universities.filter((uni) =>
    uni.name.toLowerCase().includes(search.toLowerCase()) ||
    uni.shortName.toLowerCase().includes(search.toLowerCase()) ||
    uni.state.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-3">
      {/* Search within universities */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-secondary">
        <Search className="w-4 h-4 text-text-tertiary" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search universities..."
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none"
        />
      </div>

      {/* University list */}
      <div className="space-y-1 max-h-[40vh] overflow-y-auto">
        {/* "All Universities" option */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => onChange(null)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left',
            selected === null
              ? 'bg-cn-purple/10 border border-cn-purple/20'
              : 'hover:bg-surface-secondary'
          )}
        >
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0',
            selected === null
              ? 'gradient-bg text-white'
              : 'bg-surface-secondary text-text-secondary'
          )}>
            All
          </div>
          <div className="flex-1">
            <span className="text-sm font-medium text-text-primary">All Universities</span>
            <span className="text-xs text-text-tertiary block">Show listings from everywhere</span>
          </div>
          {selected === null && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            >
              <Check className="w-5 h-5 text-cn-purple" />
            </motion.div>
          )}
        </motion.button>

        {filtered.map((uni) => (
          <motion.button
            key={uni.id}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(uni.id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left',
              selected === uni.id
                ? 'bg-cn-purple/10 border border-cn-purple/20'
                : 'hover:bg-surface-secondary'
            )}
          >
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0',
              selected === uni.id
                ? 'gradient-bg text-white'
                : 'bg-surface-secondary text-text-secondary'
            )}>
              {uni.shortName.slice(0, 3)}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-text-primary block truncate">{uni.name}</span>
              <span className="text-xs text-text-tertiary flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {uni.state} · {uni.areas.length} areas
              </span>
            </div>
            {selected === uni.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              >
                <Check className="w-5 h-5 text-cn-purple" />
              </motion.div>
            )}
          </motion.button>
        ))}

        {filtered.length === 0 && (
          <div className="py-8 text-center text-sm text-text-tertiary">
            No universities match &quot;{search}&quot;
          </div>
        )}
      </div>
    </div>
  );
}
