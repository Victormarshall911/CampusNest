'use client';

import Link from 'next/link';
import { BadgeCheck, Star, ShieldCheck, Clock, Layers, Calendar, MessageSquare } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Avatar from '@/components/ui/Avatar';
import type { Landlord } from '@/data/mockData';

interface LandlordCardProps {
  landlord: Landlord;
}

export default function LandlordCard({ landlord }: LandlordCardProps) {
  return (
    <GlassCard variant="solid" className="p-4 relative overflow-hidden">
      {/* Verified landlord watermark card effect */}
      {landlord.isVerified && (
        <div className="absolute -top-4 -right-4 w-24 h-24 text-cn-purple/5 pointer-events-none">
          <ShieldCheck className="w-full h-full" />
        </div>
      )}

      {/* Profile Header */}
      <div className="flex gap-4">
        <Link href={`/profile/${landlord.id}`} className="hover:opacity-90 transition-opacity">
          <Avatar
            src={landlord.avatar}
            alt={landlord.name}
            size="lg"
            isVerified={landlord.isVerified}
          />
        </Link>

        <div className="flex-1 min-w-0">
          <Link href={`/profile/${landlord.id}`} className="hover:underline">
            <h4 className="text-base font-bold text-text-primary flex items-center gap-1 truncate">
              {landlord.name}
            </h4>
          </Link>
          <div className="flex items-center gap-1 mt-0.5 text-xs text-text-secondary">
            <Clock className="w-3.5 h-3.5" />
            <span>{landlord.responseTime}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold">
              <Star className="w-2.5 h-2.5 fill-current" />
              {landlord.rating} Rating
            </span>
            {landlord.isVerified && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-cn-blue/10 text-cn-blue text-[10px] font-semibold">
                <BadgeCheck className="w-3 h-3 fill-current text-cn-blue text-white" />
                Verified Agent
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Grid Meta details */}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-[var(--border-light)]">
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <Layers className="w-4 h-4 text-text-tertiary" />
          <div>
            <span className="font-bold text-text-primary block">{landlord.totalListings}</span>
            <span>Active Listings</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <Calendar className="w-4 h-4 text-text-tertiary" />
          <div>
            <span className="font-bold text-text-primary block">{landlord.joinedDate}</span>
            <span>Joined Host</span>
          </div>
        </div>
      </div>

      {/* View profile button link */}
      <div className="mt-4">
        <Link
          href={`/profile/${landlord.id}`}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-cn-purple/20 text-cn-purple hover:bg-cn-purple/5 text-xs font-semibold transition-colors active:scale-98"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          View Agent Profile
        </Link>
      </div>
    </GlassCard>
  );
}
