'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  BadgeCheck,
  ShieldCheck,
  Star,
  Clock,
  Layers,
  Bookmark,
  FileText,
  MessageCircle,
  PencilLine,
  GraduationCap,
} from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import FilterSheet from '@/components/discover/FilterSheet';
import AvatarUpload from '@/components/profile/AvatarUpload';
import type { CampusUser } from '@/data/mockData';

// ── Count-up helper — fires once on mount only ───────────────────────────────
function CountUp({
  to,
  delay = 0,
  decimals = 0,
}: {
  to: number;
  delay?: number;
  decimals?: number;
}) {
  const [count, setCount] = useState(0);
  // Capture initial values in refs so the effect has no external deps
  const toRef = useRef(to);
  const delayRef = useRef(delay);
  const decimalsRef = useRef(decimals);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const targetValue = toRef.current;
    const startDelay = delayRef.current;
    const dp = decimalsRef.current;

    const startTimer = setTimeout(() => {
      const steps = 20;
      const duration = 400;
      const intervalMs = duration / steps;
      let step = 0;

      const t = setInterval(() => {
        step++;
        const progress = step / steps;
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(parseFloat((targetValue * eased).toFixed(dp)));
        if (step >= steps) {
          setCount(targetValue);
          clearInterval(t);
        }
      }, intervalMs);

      return () => clearInterval(t);
    }, startDelay);

    return () => clearTimeout(startTimer);
  }, []);

  return <>{decimals > 0 ? count.toFixed(decimals) : count}</>;
}

// ── ProfileHeader ─────────────────────────────────────────────────────────────
interface ProfileHeaderProps {
  user: CampusUser;
  isOwnProfile: boolean;
  // Pre-computed stats
  savedCount: number;
  postsCount: number;
  activeListingsCount: number;
  avgRating: number;
  reviewCount: number;
}

export default function ProfileHeader({
  user,
  isOwnProfile,
  savedCount,
  postsCount,
  activeListingsCount,
  avgRating,
  reviewCount,
}: ProfileHeaderProps) {
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const handleUpdate = async () => {
    if (!name.trim()) {
      setUpdateError('Name cannot be empty');
      return;
    }

    setUpdating(true);
    setUpdateError(null);

    try {
      const res = await fetch(`/api/users/${user.id}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), bio: bio.trim() }),
      });

      if (!res.ok) {
        throw new Error('Failed to update profile settings');
      }

      setEditSheetOpen(false);
      window.location.reload();
    } catch (err: any) {
      setUpdateError(err.message || 'Something went wrong');
    } finally {
      setUpdating(false);
    }
  };

  const isStudent = user.role === 'student';

  const stats = isStudent
    ? [
        { label: 'Saved', value: savedCount, decimals: 0, icon: <Bookmark className="w-3.5 h-3.5" />, delay: 0 },
        { label: 'Posts', value: postsCount, decimals: 0, icon: <FileText className="w-3.5 h-3.5" />, delay: 80 },
      ]
    : [
        { label: 'Listings', value: activeListingsCount, decimals: 0, icon: <Layers className="w-3.5 h-3.5" />, delay: 0 },
        { label: 'Avg Rating', value: avgRating, decimals: 1, icon: <Star className="w-3.5 h-3.5" />, delay: 80 },
        { label: 'Reviews', value: reviewCount, decimals: 0, icon: <Star className="w-3.5 h-3.5 fill-current" />, delay: 160 },
      ];

  return (
    <>
      {/* ── Banner ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 1.02 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 30 }}
        className="relative h-44 w-full overflow-hidden"
        style={{
          background: user.isVerified
            ? 'linear-gradient(135deg, #6C3CE1 0%, #3B82F6 80%, #5B21B6 100%)'
            : 'linear-gradient(135deg, #e0e7ff 0%, #f0f9ff 60%, #f8f4ff 100%)',
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute top-8 -right-4 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-8 left-6 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
        {/* Verified shield watermark */}
        {user.isVerified && (
          <div className="absolute bottom-4 right-6 text-white/10 pointer-events-none">
            <ShieldCheck className="w-24 h-24" />
          </div>
        )}
      </motion.div>

      {/* ── Avatar + Actions row ──────────────────────────────────── */}
      <div className="px-4">
        <div className="flex items-end justify-between -mt-12 mb-3">
          {/* Avatar with optional gradient ring */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 30, delay: 0.1 }}
          >
            <div
              className={
                user.isVerified
                  ? 'p-[3px] rounded-full bg-gradient-to-br from-cn-purple to-cn-blue shadow-lg shadow-cn-purple/30'
                  : 'p-[3px] rounded-full bg-surface-secondary'
              }
            >
              <div className="bg-surface-primary rounded-full p-0.5">
                {isOwnProfile ? (
                  <AvatarUpload
                    userId={user.id}
                    currentAvatar={user.avatar}
                    userName={user.name}
                    onUpdateSuccess={() => {
                      window.location.reload();
                    }}
                  />
                ) : (
                  <Avatar
                    src={user.avatar}
                    alt={user.name}
                    size="lg"
                    className="!w-20 !h-20"
                  />
                )}
              </div>
            </div>
          </motion.div>

          {/* Action button */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 30, delay: 0.2 }}
          >
            {isOwnProfile ? (
              <button
                onClick={() => setEditSheetOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--border-medium)] text-text-primary text-xs font-semibold hover:bg-surface-secondary transition-colors active:scale-95"
              >
                <PencilLine className="w-3.5 h-3.5" />
                Edit Profile
              </button>
            ) : (
              <Link
                href={`/messages/${user.id}`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-bg text-white text-xs font-bold shadow-md shadow-cn-purple/20 hover:brightness-110 transition-all active:scale-95"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Message
              </Link>
            )}
          </motion.div>
        </div>

        {/* ── Name + subtext ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 30, delay: 0.15 }}
          className="space-y-1 mb-4"
        >
          <div className="flex items-center gap-2">
            <h1
              className="text-lg font-extrabold text-text-primary leading-none"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {user.name}
            </h1>
            {user.isVerified && (
              <BadgeCheck className="w-5 h-5 text-cn-blue fill-white shrink-0" strokeWidth={2.5} />
            )}
          </div>

          {isStudent ? (
            <div className="flex items-center gap-1.5 text-xs text-text-secondary">
              <GraduationCap className="w-3.5 h-3.5 text-cn-purple shrink-0" />
              <span>
                {user.universityShortName} · {user.level} · {user.department}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-text-secondary">
              <Clock className="w-3.5 h-3.5 text-cn-purple shrink-0" />
              <span>
                Landlord · {user.responseTime?.replace('Usually responds ', '')} · Joined {user.joinedDate}
              </span>
            </div>
          )}

          {user.bio && (
            <p className="text-xs text-text-secondary leading-relaxed pt-0.5">{user.bio}</p>
          )}
        </motion.div>

        {/* ── Stats row ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 30, delay: 0.22 }}
          className="flex items-stretch gap-2 mb-5"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 rounded-xl glass-solid text-center"
            >
              <span className="text-lg font-extrabold gradient-text leading-none">
                <CountUp to={stat.value} delay={stat.delay} decimals={stat.decimals} />
              </span>
              <div className="flex items-center gap-1 text-[10px] text-text-tertiary font-medium">
                {stat.icon}
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Edit Profile sheet ───────────────────────────── */}
      <FilterSheet
        isOpen={editSheetOpen}
        onClose={() => setEditSheetOpen(false)}
        title="Edit Profile"
        onApply={handleUpdate}
        onClear={() => {
          setName(user.name);
          setBio(user.bio || '');
        }}
      >
        <div className="space-y-4 py-2 px-1">
          {updateError && (
            <div className="p-3.5 rounded-xl bg-cn-coral/10 border border-cn-coral/25 text-xs text-cn-coral">
              {updateError}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              disabled={updating}
              className="w-full px-4 py-2.5 rounded-xl glass-solid border border-[var(--border-light)] text-xs font-semibold outline-none focus:border-cn-purple/35 focus:ring-2 focus:ring-cn-purple/10 transition-all bg-[var(--background)] text-text-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
              Bio / Description
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              disabled={updating}
              className="w-full px-4 py-2.5 rounded-xl glass-solid border border-[var(--border-light)] text-xs font-semibold outline-none focus:border-cn-purple/35 focus:ring-2 focus:ring-cn-purple/10 transition-all bg-[var(--background)] text-text-primary resize-none"
            />
          </div>
        </div>
      </FilterSheet>
    </>
  );
}
