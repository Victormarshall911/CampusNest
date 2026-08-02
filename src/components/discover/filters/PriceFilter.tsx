'use client';

import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { formatNaira } from '@/lib/utils';

interface PriceFilterProps {
  range: [number, number];
  onChange: (range: [number, number]) => void;
}

const MIN_PRICE = 0;
const MAX_PRICE = 1000000;
const STEP = 10000;

export default function PriceFilter({ range, onChange }: PriceFilterProps) {
  const [localRange, setLocalRange] = useState<[number, number]>(range);
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<'min' | 'max' | null>(null);

  const pctMin = ((localRange[0] - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;
  const pctMax = ((localRange[1] - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;

  const snapToStep = (val: number) => Math.round(val / STEP) * STEP;

  const handlePointerDown = (handle: 'min' | 'max', e: React.PointerEvent) => {
    e.preventDefault();
    draggingRef.current = handle;

    const onMove = (ev: PointerEvent) => {
      if (!trackRef.current || !draggingRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
      const rawVal = MIN_PRICE + pct * (MAX_PRICE - MIN_PRICE);
      const val = snapToStep(rawVal);

      setLocalRange((prev) => {
        if (draggingRef.current === 'min') {
          const newMin = Math.min(val, prev[1] - STEP);
          return [Math.max(MIN_PRICE, newMin), prev[1]];
        } else {
          const newMax = Math.max(val, prev[0] + STEP);
          return [prev[0], Math.min(MAX_PRICE, newMax)];
        }
      });
    };

    const onUp = () => {
      draggingRef.current = null;
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      // Commit value
      setLocalRange((r) => { onChange(r); return r; });
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  // Sync from parent prop changes during render (React-recommended pattern)
  const [prevRange, setPrevRange] = useState(range);
  if (prevRange[0] !== range[0] || prevRange[1] !== range[1]) {
    setPrevRange(range);
    setLocalRange(range);
  }

  // Quick preset buttons
  const presets = [
    { label: 'Under ₦150k', range: [0, 150000] as [number, number] },
    { label: '₦150k – ₦300k', range: [150000, 300000] as [number, number] },
    { label: '₦300k – ₦500k', range: [300000, 500000] as [number, number] },
    { label: '₦500k+', range: [500000, 1000000] as [number, number] },
  ];

  return (
    <div className="space-y-6">
      {/* Live range labels */}
      <div className="flex items-center justify-between">
        <div className="text-center">
          <span className="text-xs text-text-tertiary block">Min</span>
          <span className="text-base font-bold gradient-text">{formatNaira(localRange[0])}</span>
        </div>
        <div className="text-text-tertiary mx-2">—</div>
        <div className="text-center">
          <span className="text-xs text-text-tertiary block">Max</span>
          <span className="text-base font-bold gradient-text">{formatNaira(localRange[1])}</span>
        </div>
      </div>

      {/* Dual-handle slider */}
      <div className="relative px-2 py-4" ref={trackRef}>
        {/* Track background */}
        <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-surface-secondary" />

        {/* Active range */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full gradient-bg"
          style={{ left: `calc(${pctMin}% + 8px)`, right: `calc(${100 - pctMax}% + 8px)` }}
        />

        {/* Min handle */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border-2 border-cn-purple shadow-lg cursor-grab active:cursor-grabbing z-10"
          style={{ left: `${pctMin}%` }}
          onPointerDown={(e) => handlePointerDown('min', e)}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 1.1 }}
        >
          <div className="absolute inset-1 rounded-full gradient-bg" />
        </motion.div>

        {/* Max handle */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border-2 border-cn-blue shadow-lg cursor-grab active:cursor-grabbing z-10"
          style={{ left: `${pctMax}%` }}
          onPointerDown={(e) => handlePointerDown('max', e)}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 1.1 }}
        >
          <div className="absolute inset-1 rounded-full gradient-bg" />
        </motion.div>
      </div>

      {/* Range labels */}
      <div className="flex justify-between text-xs text-text-tertiary px-2">
        <span>₦0</span>
        <span>₦1M</span>
      </div>

      {/* Quick presets */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-text-tertiary uppercase tracking-wide">Quick select</span>
        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset) => {
            const isActive = localRange[0] === preset.range[0] && localRange[1] === preset.range[1];
            return (
              <motion.button
                key={preset.label}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setLocalRange(preset.range);
                  onChange(preset.range);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'gradient-bg text-white shadow-md shadow-cn-purple/20'
                    : 'bg-surface-secondary text-text-secondary hover:bg-surface-primary'
                }`}
              >
                {preset.label}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
