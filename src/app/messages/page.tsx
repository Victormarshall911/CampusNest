'use client';

import { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { CURRENT_USER_ID } from '@/data/mockData';
import { mockChatStore, type Conversation } from '@/lib/mockChatStore';
import ConversationList from '@/components/messages/ConversationList';

export default function MessagesIndexPage() {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    return mockChatStore.getConversations();
  });
  const [loading, setLoading] = useState(true);

  // Sync / subscribe to store changes
  useEffect(() => {
    // Simulate initial mount delay for loading skeleton
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);

    const unsubscribe = mockChatStore.subscribe(() => {
      setConversations(mockChatStore.getConversations());
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  return (
    <main className="min-h-screen bg-[var(--background)] pb-24">
      {/* Sticky header bar */}
      <div className="glass-nav px-4 py-4 border-b border-[var(--border-light)] sticky top-0 z-20">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cn-purple" />
            <h1 className="text-base font-extrabold text-text-primary" style={{ fontFamily: 'var(--font-display)' }}>
              Messages
            </h1>
          </div>
          <span className="text-[10px] text-text-tertiary font-bold uppercase tracking-wider">
            Mock Session
          </span>
        </div>
      </div>

      <div className="max-w-xl mx-auto py-4">
        {loading ? (
          // Loading skeleton lists
          <div className="space-y-3 px-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 rounded-2xl glass-solid flex items-center gap-3 animate-pulse border border-[var(--border-light)]">
                <div className="w-10 h-10 rounded-full bg-surface-secondary shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-surface-secondary rounded w-28" />
                  <div className="h-2 bg-surface-secondary rounded w-full max-w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ConversationList
            conversations={conversations}
            currentUserId={CURRENT_USER_ID}
          />
        )}
      </div>
    </main>
  );
}
