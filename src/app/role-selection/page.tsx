'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, ShieldCheck, Check, Sparkles, Building2 } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';

interface UniItem {
  id: string;
  name: string;
  shortName: string;
}

export default function RoleSelectionPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  
  const [role, setRole] = useState<'STUDENT' | 'LANDLORD'>('STUDENT');
  const [universityId, setUniversityId] = useState('');
  const [unis, setUnis] = useState<UniItem[]>([]);
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already authenticated and onboarded
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    } else if (status === 'authenticated') {
      const user = session?.user as any;
      // If joinedDate is already configured, onboarding is complete
      if (user && user.joinedDate) {
        router.replace('/');
      }
    }
  }, [status, session, router]);

  // Load universities list on mount
  useEffect(() => {
    fetch('/api/universities')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUnis(data);
          if (data.length > 0) setUniversityId(data[0].id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleConfirm = async () => {
    if (role === 'STUDENT' && !universityId) {
      setError('Please select your university');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/user/role-selection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, universityId: role === 'STUDENT' ? universityId : undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile settings');
      }

      // Dynamic session update trigger to reload token cookies
      await update({
        role,
        universityId: role === 'STUDENT' ? universityId : null,
      });

      router.replace('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6">
        <div className="skeleton h-48 w-80 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Glow decorations */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-cn-purple/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-cn-blue/10 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10 space-y-6"
      >
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-cn-purple/10 flex items-center justify-center mx-auto mb-4 text-cn-purple">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black font-[var(--font-display)] text-text-primary tracking-tight">
            Configure Your Account
          </h1>
          <p className="text-xs text-text-secondary mt-1.5">
            Select your account type to personalize your housing experience
          </p>
        </div>

        <GlassCard variant="elevated" className="p-6 md:p-8 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-cn-coral/10 border border-cn-coral/25 text-xs text-cn-coral">
              {error}
            </div>
          )}

          {/* Account Options Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Student Card */}
            <button
              type="button"
              onClick={() => setRole('STUDENT')}
              className={`p-5 rounded-2xl border text-left flex flex-col justify-between h-40 transition-all cursor-pointer ${
                role === 'STUDENT'
                  ? 'border-cn-purple bg-cn-purple/[0.02] shadow-md shadow-cn-purple/5'
                  : 'border-[var(--border-light)] bg-transparent hover:bg-surface-secondary/20'
              }`}
            >
              <div className="flex justify-between items-start w-full">
                <div className={`p-2.5 rounded-xl ${role === 'STUDENT' ? 'bg-cn-purple/15 text-cn-purple' : 'bg-surface-secondary text-text-tertiary'}`}>
                  <GraduationCap className="w-5 h-5" />
                </div>
                {role === 'STUDENT' && (
                  <span className="w-5 h-5 rounded-full gradient-bg flex items-center justify-center text-white shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-xs font-bold text-text-primary">I am a Student</h3>
                <p className="text-[10px] text-text-secondary mt-1 leading-relaxed">
                  Search active campus lodges, review landlords and request roommates.
                </p>
              </div>
            </button>

            {/* Landlord Card */}
            <button
              type="button"
              onClick={() => setRole('LANDLORD')}
              className={`p-5 rounded-2xl border text-left flex flex-col justify-between h-40 transition-all cursor-pointer ${
                role === 'LANDLORD'
                  ? 'border-cn-purple bg-cn-purple/[0.02] shadow-md shadow-cn-purple/5'
                  : 'border-[var(--border-light)] bg-transparent hover:bg-surface-secondary/20'
              }`}
            >
              <div className="flex justify-between items-start w-full">
                <div className={`p-2.5 rounded-xl ${role === 'LANDLORD' ? 'bg-cn-purple/15 text-cn-purple' : 'bg-surface-secondary text-text-tertiary'}`}>
                  <Building2 className="w-5 h-5" />
                </div>
                {role === 'LANDLORD' && (
                  <span className="w-5 h-5 rounded-full gradient-bg flex items-center justify-center text-white shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-xs font-bold text-text-primary">I am a Landlord / Agent</h3>
                <p className="text-[10px] text-text-secondary mt-1 leading-relaxed">
                  Publish listing posts, manage lodges and chat with student tenants.
                </p>
              </div>
            </button>
          </div>

          {/* Student University Selection Selector */}
          <AnimatePresence>
            {role === 'STUDENT' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1.5 overflow-hidden"
              >
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                  Select University
                </label>
                <select
                  value={universityId}
                  onChange={(e) => setUniversityId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-solid border border-[var(--border-light)] text-xs font-semibold outline-none focus:border-cn-purple/35 focus:ring-2 focus:ring-cn-purple/10 transition-all bg-[var(--background)] text-text-primary"
                >
                  {unis.map((uni) => (
                    <option key={uni.id} value={uni.id}>
                      {uni.name} ({uni.shortName})
                    </option>
                  ))}
                </select>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="w-full py-3 rounded-xl text-white gradient-bg text-xs font-bold shadow-lg shadow-cn-purple/20 hover:shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Updating profile...' : 'Confirm Account Details'}
          </button>
        </GlassCard>
      </motion.div>
    </main>
  );
}
