'use client';

import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
}

interface ProfileTabsProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
}

/**
 * Segmented control with animated sliding pill — mirrors ResultsToggle's
 * spring config (stiffness: 400, damping: 28) exactly.
 */
export default function ProfileTabs({ tabs, active, onChange }: ProfileTabsProps) {
  const activeIndex = tabs.findIndex((t) => t.id === active);
  const pct = activeIndex / tabs.length;
  const width = `calc(${100 / tabs.length}% - 4px)`;

  return (
    <div className="relative flex items-center glass-solid rounded-xl p-1 w-full">
      {/* Sliding pill */}
      <motion.div
        className="absolute top-1 bottom-1 rounded-lg gradient-bg shadow-md shadow-cn-purple/15 pointer-events-none"
        animate={{
          left: `calc(${pct * 100}% + 4px)`,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        style={{ width }}
      />

      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'relative z-10 flex-1 text-center py-2 px-3 rounded-lg text-sm font-semibold transition-colors',
            tab.id === active
              ? 'text-white'
              : 'text-text-secondary hover:text-text-primary'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Wrapper that cross-fades content when the active tab changes.
 * Wrap each tab's content panel in this with a unique key.
 */
export function TabContent({
  tabKey,
  children,
}: {
  tabKey: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tabKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
