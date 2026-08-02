'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValueEvent, useScroll } from 'motion/react';
import { Bell, Sparkles } from 'lucide-react';

export default function FeedHeader() {
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const diff = latest - lastScrollY.current;
    if (Math.abs(diff) > 5) {
      setHidden(diff > 0 && latest > 60);
      lastScrollY.current = latest;
    }
  });

  return (
    <motion.header
      animate={{ y: hidden ? -80 : 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 right-0 z-40 md:pl-64"
    >
      <div className="glass-nav px-4 py-3 border-b border-[var(--border-light)]">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center shadow-md shadow-cn-purple/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              <span className="gradient-text">Campus</span>
              <span className="text-text-primary">Nest</span>
            </h1>
          </div>

          {/* Notification bell */}
          <button className="relative p-2 rounded-xl hover:bg-surface-secondary transition-colors active:scale-95">
            <Bell className="w-5 h-5 text-text-secondary" />
            {/* Notification badge */}
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-cn-coral border-2 border-white" />
          </button>
        </div>
      </div>
    </motion.header>
  );
}
