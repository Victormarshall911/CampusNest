'use client';

import { motion } from 'motion/react';
import { Check, Home, Users, BedSingle, Building2, Hotel, Warehouse, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoomTypeFilterProps {
  selected: string[];
  onChange: (types: string[]) => void;
}

const roomTypes = [
  { id: 'Self-Contain', label: 'Self-Contain', icon: Home },
  { id: 'Shared Room', label: 'Shared Room', icon: Users },
  { id: '1-Bedroom', label: '1-Bedroom', icon: BedSingle },
  { id: 'Mini Flat', label: 'Mini Flat', icon: Building2 },
  { id: '2-Bedroom', label: '2-Bedroom', icon: LayoutGrid },
  { id: 'Hostel Bed', label: 'Hostel Bed', icon: Hotel },
  { id: 'Studio', label: 'Studio', icon: Warehouse },
];

export default function RoomTypeFilter({ selected, onChange }: RoomTypeFilterProps) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((t) => t !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {roomTypes.map((type) => {
        const isActive = selected.includes(type.id);
        const Icon = type.icon;

        return (
          <motion.button
            key={type.id}
            whileTap={{ scale: 0.93 }}
            onClick={() => toggle(type.id)}
            className={cn(
              'relative flex flex-col items-center gap-2 px-3 py-4 rounded-xl transition-all border',
              isActive
                ? 'bg-cn-purple/10 border-cn-purple/25 shadow-sm'
                : 'bg-surface-secondary border-transparent hover:bg-surface-primary'
            )}
          >
            <motion.div
              animate={isActive ? { scale: [1, 1.15, 1] } : { scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            >
              <Icon className={cn(
                'w-6 h-6 transition-colors',
                isActive ? 'text-cn-purple' : 'text-text-secondary'
              )} />
            </motion.div>
            <span className={cn(
              'text-xs font-medium transition-colors',
              isActive ? 'text-cn-purple' : 'text-text-secondary'
            )}>
              {type.label}
            </span>

            {/* Check badge */}
            {isActive && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 12 }}
                className="absolute top-2 right-2 w-4 h-4 rounded-full gradient-bg flex items-center justify-center"
              >
                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
