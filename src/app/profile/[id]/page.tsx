'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { User, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export default function ProfilePlaceholderPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <main className="min-h-screen max-w-xl mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/discover" className="p-2 rounded-full hover:bg-surface-secondary">
          <ArrowLeft className="w-5 h-5 text-text-primary" />
        </Link>
        <h1 className="text-lg font-bold gradient-text" style={{ fontFamily: 'var(--font-display)' }}>
          Profile Info
        </h1>
      </div>

      {/* Profile Placeholder content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col items-center justify-center text-center py-20"
      >
        <div className="w-16 h-16 rounded-2xl bg-surface-secondary flex items-center justify-center mb-4">
          <User className="w-8 h-8 text-cn-blue" />
        </div>
        <h2 className="text-base font-bold text-text-primary mb-2">
          Landlord Profile (ID: {id})
        </h2>
        <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
          Detailed landlord profiles showing ratings and active listing grids are coming in **Phase 4**.
        </p>
      </motion.div>
    </main>
  );
}
