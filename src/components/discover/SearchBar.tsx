'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const [focused, setFocused] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedOnChange = useDebouncedCallback((val: string) => {
    onChange(val);
  }, 300);

  const handleChange = (val: string) => {
    setLocalValue(val);
    debouncedOnChange(val);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <motion.div
      animate={{
        scale: focused ? 1.02 : 1,
        boxShadow: focused
          ? '0 8px 32px rgba(108, 60, 225, 0.12), 0 0 0 2px rgba(108, 60, 225, 0.2)'
          : '0 4px 16px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.04)',
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="glass-solid rounded-2xl overflow-hidden"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <motion.div
          animate={{ scale: focused ? 1.1 : 1, color: focused ? '#6C3CE1' : '#94a3b8' }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <Search className="w-5 h-5" />
        </motion.div>
        <input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search lodges, areas, universities..."
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none"
        />
        <AnimatePresence>
          {localValue && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              onClick={handleClear}
              className="p-1 rounded-full bg-surface-secondary hover:bg-cn-purple/10 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-text-secondary" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
