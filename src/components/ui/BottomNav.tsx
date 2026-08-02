'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { Home, Search, PlusSquare, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { mockChatStore } from '@/lib/mockChatStore';
import { CURRENT_USER_ID } from '@/data/mockData';

const tabs = [
  { id: 'home', label: 'Home', icon: Home, href: '/' },
  { id: 'discover', label: 'Discover', icon: Search, href: '/discover' },
  { id: 'post', label: 'Post', icon: PlusSquare, href: '/create' },
  { id: 'messages', label: 'Messages', icon: MessageCircle, href: '/messages' },
  { id: 'profile', label: 'Profile', icon: User, href: '/profile' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState<number>(() => {
    return mockChatStore.getUnreadCount(CURRENT_USER_ID);
  });

  useEffect(() => {
    const unsubscribe = mockChatStore.subscribe(() => {
      setUnreadCount(mockChatStore.getUnreadCount(CURRENT_USER_ID));
    });

    return unsubscribe;
  }, []);

  return (
    <>
      {/* Spacer to prevent content from hiding behind the fixed nav */}
      <div className="h-20 md:hidden" />

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-nav safe-bottom">
        <div className="flex items-center justify-around px-2 h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
            const isPost = tab.id === 'post';

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-0.5 w-16 h-14 rounded-xl transition-colors',
                  isActive && !isPost && 'text-cn-purple',
                  !isActive && 'text-text-tertiary',
                )}
              >
                {isPost ? (
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-cn-purple/25"
                  >
                    <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                  </motion.div>
                ) : (
                  <>
                    <motion.div
                      whileTap={{ scale: 0.85 }}
                      animate={isActive ? { scale: 1 } : { scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                      className="relative"
                    >
                      <Icon
                        className={cn(
                          'w-6 h-6 transition-all duration-200',
                           isActive && 'stroke-[2.5px]'
                        )}
                      />
                      {/* Unread badge dot */}
                      {tab.id === 'messages' && unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#6C3CE1] text-white text-[7px] font-black flex items-center justify-center border border-white animate-pulse" />
                      )}
                    </motion.div>
                    <span className={cn(
                      'text-[10px] font-medium transition-opacity',
                      isActive ? 'opacity-100' : 'opacity-60'
                    )}>
                      {tab.label}
                    </span>

                    {/* Active indicator dot */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute -top-0.5 w-5 h-0.5 rounded-full gradient-bg"
                        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                      />
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 glass-solid border-r border-[var(--border-light)] flex-col p-4 z-50">
        <Link href="/" className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
            <Home className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold font-[var(--font-display)]">
            <span className="gradient-text">Campus</span>
            <span className="text-text-primary">Nest</span>
          </span>
        </Link>

        <div className="flex flex-col gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'bg-cn-purple/10 text-cn-purple'
                    : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive && 'stroke-[2.5px]')} />
                {tab.label}
                {tab.id === 'messages' && unreadCount > 0 && (
                  <span className="ml-2 w-4.5 h-4.5 rounded-full bg-[#6C3CE1] text-white text-[8px] font-black flex items-center justify-center border border-white shrink-0 shadow-sm" style={{ minWidth: '18px' }}>
                    {unreadCount}
                  </span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="desktopActiveTab"
                    className="ml-auto w-1.5 h-1.5 rounded-full gradient-bg"
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
}
