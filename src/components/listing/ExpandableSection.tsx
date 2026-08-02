'use client';

import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

interface ExpandableSectionProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultExpanded?: boolean;
}

export default function ExpandableSection({
  title,
  icon,
  children,
  defaultExpanded = false,
}: ExpandableSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="border-b border-[var(--border-light)] py-3">
      {/* Header Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left py-2 hover:opacity-85 transition-opacity"
      >
        <div className="flex items-center gap-3">
          {icon && <div className="text-cn-purple shrink-0">{icon}</div>}
          <span className="text-base font-semibold text-text-primary" style={{ fontFamily: 'var(--font-display)' }}>
            {title}
          </span>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-5 h-5 text-text-secondary" />
        </motion.div>
      </button>

      {/* Accordion Expand/Collapse Container */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 32 }}
            className="overflow-hidden"
          >
            <div className="pt-2 pb-3 text-sm text-text-secondary leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
