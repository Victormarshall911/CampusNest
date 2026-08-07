'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Home, Sparkles, Star, PlusSquare, ArrowRight, UserPlus, Info } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { type CampusUser } from '@/data/mockData';
import { cn } from '@/lib/utils';
import CreatePostWizard from '@/components/create/CreatePostWizard';
import QuickPostSheet from '@/components/create/QuickPostSheet';

export default function CreatePostEntryPage() {
  const { data: session, status } = useSession();
  const currentUserId = (session?.user as any)?.id;

  const [currentUser, setCurrentUser] = useState<CampusUser | null>(null);

  // Fetch full user profile details from Postgres API on session load
  useEffect(() => {
    if (status === 'loading' || !currentUserId) return;
    
    fetch(`/api/users/${currentUserId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setCurrentUser(data);
        }
      })
      .catch((err) => console.error(err));
  }, [currentUserId, status]);

  const isLandlord = currentUser?.role === 'landlord';

  if (status === 'loading' || !currentUser) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="skeleton h-12 w-12 rounded-full animate-spin border-4 border-cn-purple border-t-transparent" />
      </div>
    );
  }

  // Toggle state to open wizard vs main choice grid
  const [showWizard, setShowWizard] = useState(false);
  const [isQuickPostOpen, setIsQuickPostOpen] = useState(false);
  const [quickPostTab, setQuickPostTab] = useState<'review' | 'roommate'>('review');

  const openQuickPost = (tab: 'review' | 'roommate') => {
    setQuickPostTab(tab);
    setIsQuickPostOpen(true);
  };

  if (showWizard) {
    return (
      <main className="min-h-screen bg-[var(--background)]">
        {/* Wizard Header Bar */}
        <div className="glass-nav px-4 py-3.5 border-b border-[var(--border-light)] md:pl-64 sticky top-0 z-30">
          <div className="max-w-xl mx-auto flex items-center justify-between">
            <button
              onClick={() => setShowWizard(false)}
              className="text-xs font-bold text-text-secondary hover:text-text-primary flex items-center gap-1 cursor-pointer"
            >
              Cancel listing
            </button>
            <span className="text-xs font-black gradient-text">CampusNest wizard</span>
          </div>
        </div>
        <div className="pt-2">
          <CreatePostWizard currentUserId={currentUser.id} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] pb-24">
      {/* Page Header */}
      <div className="glass-nav px-4 py-4 border-b border-[var(--border-light)] sticky top-0 z-20">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlusSquare className="w-5 h-5 text-cn-purple" />
            <h1 className="text-base font-extrabold text-text-primary" style={{ fontFamily: 'var(--font-display)' }}>
              Create a Post
            </h1>
          </div>
          <span className="text-[10px] text-text-tertiary font-bold uppercase tracking-wider">
            Mock session mode
          </span>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-8 space-y-6">
        {/* Intro Greeting Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl glass border border-[var(--border-light)] space-y-2 relative overflow-hidden"
        >
          <div className="absolute -right-6 -bottom-6 w-20 h-20 text-cn-purple/5 pointer-events-none">
            <Sparkles className="w-full h-full" />
          </div>
          <span className="text-[9px] font-extrabold text-cn-purple bg-cn-purple/10 px-2 py-0.5 rounded uppercase tracking-wider">
            Welcome back, {currentUser.name}
          </span>
          <h2 className="text-base font-black text-text-primary leading-tight">
            What would you like to publish today?
          </h2>
          <p className="text-xs text-text-secondary leading-relaxed pt-0.5">
            List a property for rent, review a lodge you stayed in, or find a roommate for the semester.
          </p>
        </motion.div>

        {/* Landlord Option (Primary if landlord, secondary if student) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cn(
            'p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group',
            isLandlord
              ? 'gradient-bg border-transparent text-white shadow-xl shadow-cn-purple/20'
              : 'glass border-[var(--border-light)] hover:border-cn-purple/40 hover:bg-surface-secondary/20'
          )}
          onClick={() => setShowWizard(true)}
        >
          <div className="flex gap-4">
            <div className={cn(
              'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md',
              isLandlord ? 'bg-white/20' : 'gradient-bg text-white'
            )}>
              <Home className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className={cn(
                'text-sm font-black flex items-center gap-1.5',
                isLandlord ? 'text-white' : 'text-text-primary'
              )}>
                List a Property for Rent
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
              </h3>
              <p className={cn(
                'text-xs leading-relaxed max-w-xs',
                isLandlord ? 'text-white/80' : 'text-text-secondary'
              )}>
                Publish room listings, self-contains, mini flats near campus with pictures, rules, and dynamic location maps.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Student Options */}
        <div className="space-y-3">
          <span className="text-[10px] text-text-tertiary font-bold uppercase tracking-wider block px-1">
            Student Quick Posts
          </span>

          <div className="grid grid-cols-1 gap-3">
            {/* Roommate option */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => openQuickPost('roommate')}
              className={cn(
                'p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group glass flex gap-4',
                !isLandlord
                  ? 'border-cn-purple/30 ring-1 ring-cn-purple/5 bg-cn-purple/[0.02] hover:bg-cn-purple/[0.04] hover:border-cn-purple/50'
                  : 'border-[var(--border-light)] hover:border-cn-purple/35 hover:bg-surface-secondary/20'
              )}
            >
              <div className="w-12 h-12 rounded-2xl bg-cn-purple/10 text-cn-purple flex items-center justify-center shrink-0 shadow-sm">
                <UserPlus className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-text-primary flex items-center gap-1.5">
                  Find a Roommate
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Post details of your budget, level, department, preferences to co-rent or share a lodge.
                </p>
              </div>
            </motion.div>

            {/* Review option */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              onClick={() => openQuickPost('review')}
              className="p-5 rounded-2xl border border-[var(--border-light)] transition-all cursor-pointer relative overflow-hidden group glass hover:border-cn-purple/35 hover:bg-surface-secondary/20 flex gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-cn-blue/10 text-cn-blue flex items-center justify-center shrink-0 shadow-sm">
                <Star className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-text-primary flex items-center gap-1.5">
                  Write a Lodge Review
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Share verified tenant experiences, rates, generator schedules to guide other students.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Mock Info Footer card */}
        <div className="p-4 rounded-xl bg-surface-secondary/70 border border-[var(--border-light)] flex items-start gap-3">
          <Info className="w-4 h-4 text-text-tertiary shrink-0 mt-0.5" />
          <p className="text-[10px] text-text-tertiary leading-relaxed">
            Role check is dynamic: you are currently logged in as a <strong>{currentUser.role}</strong>. You can publish under either flow to test features.
          </p>
        </div>
      </div>

      {/* Quick Post sheet */}
      <QuickPostSheet
        key={isQuickPostOpen ? `quick-post-${quickPostTab}` : 'quick-post-closed'}
        isOpen={isQuickPostOpen}
        onClose={() => setIsQuickPostOpen(false)}
        currentUser={currentUser}
        defaultTab={quickPostTab}
      />
    </main>
  );
}
