'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onApply: () => void;
  onClear: () => void;
}

export default function FilterSheet({
  isOpen,
  onClose,
  title,
  children,
  onApply,
  onClear,
}: FilterSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when open, ALWAYS restore when closed/unmounted
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleApply = () => {
    onApply();
    onClose();
  };

  const handleClear = () => {
    onClear();
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div key="filter-sheet-container" className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            key="filter-sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Mobile: Bottom Sheet */}
          <motion.div
            key="filter-sheet-mobile"
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 32 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.15}
            onDragEnd={(_, info) => {
              if (info.offset.y > 80 || info.velocity.y > 200) {
                onClose();
              }
            }}
            className="relative z-10 w-full glass-elevated rounded-t-3xl max-h-[85vh] flex flex-col md:hidden overflow-hidden"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 rounded-full bg-text-tertiary/40" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3 border-b border-[var(--border-light)]">
              <h3 className="text-lg font-semibold text-text-primary" style={{ fontFamily: 'var(--font-display)' }}>
                {title}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full hover:bg-surface-secondary transition-colors"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {children}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 px-5 py-4 border-t border-[var(--border-light)] bg-surface-primary/80 backdrop-blur-md">
              <button
                type="button"
                onClick={handleClear}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-text-secondary bg-surface-secondary hover:bg-surface-primary transition-colors active:scale-95"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white gradient-bg shadow-lg shadow-cn-purple/20 hover:shadow-xl hover:brightness-110 transition-all active:scale-95"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>

          {/* Desktop: Popover/Modal */}
          <motion.div
            key="filter-sheet-desktop"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="hidden md:flex relative z-10 w-full max-w-md glass-elevated rounded-2xl flex-col max-h-[75vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-light)]">
              <h3 className="text-lg font-semibold text-text-primary" style={{ fontFamily: 'var(--font-display)' }}>
                {title}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full hover:bg-surface-secondary transition-colors"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {children}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 px-6 py-4 border-t border-[var(--border-light)] bg-surface-primary/80 backdrop-blur-md">
              <button
                type="button"
                onClick={handleClear}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-text-secondary bg-surface-secondary hover:bg-surface-primary transition-colors active:scale-95"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white gradient-bg shadow-lg shadow-cn-purple/20 hover:shadow-xl hover:brightness-110 transition-all active:scale-95"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
