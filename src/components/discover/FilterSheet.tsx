'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  // Lock body scroll when open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Mobile: Bottom Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 300) {
                onClose();
              }
            }}
            className="fixed bottom-0 left-0 right-0 z-[61] md:hidden"
          >
            <div className="glass-elevated rounded-t-3xl max-h-[85vh] flex flex-col">
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-text-tertiary/30" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pb-3">
                <h3 className="text-lg font-semibold text-text-primary" style={{ fontFamily: 'var(--font-display)' }}>
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-surface-secondary transition-colors"
                >
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-5 pb-4">
                {children}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 px-5 py-4 border-t border-[var(--border-light)]">
                <button
                  onClick={onClear}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-text-secondary bg-surface-secondary hover:bg-surface-primary transition-colors active:scale-95"
                >
                  Clear
                </button>
                <button
                  onClick={() => { onApply(); onClose(); }}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-white gradient-bg shadow-lg shadow-cn-purple/20 hover:shadow-xl hover:brightness-110 transition-all active:scale-95"
                >
                  Apply
                </button>
              </div>
            </div>
          </motion.div>

          {/* Desktop: Popover/Modal */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="hidden md:block fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[61] w-full max-w-md"
          >
            <div className="glass-elevated rounded-2xl flex flex-col max-h-[70vh]">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-light)]">
                <h3 className="text-lg font-semibold text-text-primary" style={{ fontFamily: 'var(--font-display)' }}>
                  {title}
                </h3>
                <button
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
              <div className="flex items-center gap-3 px-6 py-4 border-t border-[var(--border-light)]">
                <button
                  onClick={onClear}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-text-secondary bg-surface-secondary hover:bg-surface-primary transition-colors active:scale-95"
                >
                  Clear
                </button>
                <button
                  onClick={() => { onApply(); onClose(); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white gradient-bg shadow-lg shadow-cn-purple/20 hover:shadow-xl hover:brightness-110 transition-all active:scale-95"
                >
                  Apply
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
