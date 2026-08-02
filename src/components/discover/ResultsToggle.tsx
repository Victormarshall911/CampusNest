'use client';

import { motion } from 'motion/react';
import { LayoutGrid, Map } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResultsToggleProps {
  view: 'grid' | 'map';
  onChange: (view: 'grid' | 'map') => void;
}

export default function ResultsToggle({ view, onChange }: ResultsToggleProps) {
  return (
    <div className="relative flex items-center glass-solid rounded-xl p-1 w-fit">
      {/* Animated sliding pill background */}
      <motion.div
        className="absolute top-1 bottom-1 rounded-lg gradient-bg shadow-md shadow-cn-purple/15"
        animate={{
          left: view === 'grid' ? 4 : '50%',
          right: view === 'map' ? 4 : '50%',
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        style={{ width: 'calc(50% - 4px)' }}
        layout
      />

      <button
        onClick={() => onChange('grid')}
        className={cn(
          'relative z-10 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
          view === 'grid' ? 'text-white' : 'text-text-secondary hover:text-text-primary'
        )}
      >
        <LayoutGrid className="w-4 h-4" />
        Grid
      </button>

      <button
        onClick={() => onChange('map')}
        className={cn(
          'relative z-10 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
          view === 'map' ? 'text-white' : 'text-text-secondary hover:text-text-primary'
        )}
      >
        <Map className="w-4 h-4" />
        Map
      </button>
    </div>
  );
}
