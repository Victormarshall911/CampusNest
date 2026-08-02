'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MessageSquare, ArrowLeft, Send } from 'lucide-react';
import { motion } from 'motion/react';
import GlassCard from '@/components/ui/GlassCard';

export default function MessagesPlaceholderPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <main className="min-h-screen max-w-xl mx-auto px-4 py-8 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/discover" className="p-2 rounded-full hover:bg-surface-secondary">
          <ArrowLeft className="w-5 h-5 text-text-primary" />
        </Link>
        <h1 className="text-lg font-bold gradient-text" style={{ fontFamily: 'var(--font-display)' }}>
          Chat Room
        </h1>
      </div>

      {/* Message content placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col items-center justify-center text-center py-20"
      >
        <div className="w-16 h-16 rounded-2xl bg-surface-secondary flex items-center justify-center mb-4">
          <MessageSquare className="w-8 h-8 text-cn-purple" />
        </div>
        <h2 className="text-base font-bold text-text-primary mb-2">
          Chat with Landlord (ID: {id})
        </h2>
        <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
          Real-time messaging with image sharing and read receipts is coming in **Phase 5**.
        </p>
      </motion.div>

      {/* Typing input dummy */}
      <GlassCard variant="solid" className="p-2 flex items-center gap-2">
        <input
          disabled
          type="text"
          placeholder="Messaging coming soon..."
          className="flex-1 bg-transparent text-xs text-text-tertiary outline-none px-2"
        />
        <button disabled className="p-2 rounded-lg bg-cn-purple/10 text-cn-purple">
          <Send className="w-4 h-4" />
        </button>
      </GlassCard>
    </main>
  );
}
