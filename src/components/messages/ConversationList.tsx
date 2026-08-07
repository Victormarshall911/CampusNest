'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, BadgeCheck } from 'lucide-react';
import { timeAgo, formatNaira, cn } from '@/lib/utils';
import { mockFeed, type ListingPost } from '@/data/mockData';
import { mockChatStore, type Conversation } from '@/lib/mockChatStore';
import Avatar from '@/components/ui/Avatar';

interface ConversationListProps {
  conversations: Conversation[];
  currentUserId: string;
}

export default function ConversationList({
  conversations,
  currentUserId,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 px-6 text-center"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-2xl glass-elevated flex items-center justify-center mb-5"
        >
          <MessageSquare className="w-8 h-8 text-text-tertiary" />
        </motion.div>
        <h3
          className="text-base font-semibold text-text-primary mb-1.5"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          No conversations yet
        </h3>
        <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
          Start by finding a lodge near your campus and messaging a verified landlord!
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-2 px-4 pb-4">
      <AnimatePresence mode="popLayout">
        {conversations.map((c, index) => {
          // Find the other participant in the conversation
          const otherUser = c.otherUser;

          // Get the last message of this conversation
          const convMessages = mockChatStore.getMessages(c.id);
          const lastMsg = convMessages[convMessages.length - 1];

          // Determine unread status
          const isUnread = lastMsg && lastMsg.senderId !== currentUserId && lastMsg.status !== 'read';

          // Get listing details if linked
          let listing: ListingPost | undefined;
          if (c.listingId) {
            listing = mockFeed.find(
              (p): p is ListingPost => p.type === 'listing' && p.id === c.listingId
            );
          }

          if (!otherUser) return null;

          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
                delay: index * 0.025,
              }}
            >
              <Link
                href={`/messages/${c.id}`}
                className={cn(
                  'flex items-center justify-between p-3.5 rounded-2xl glass-solid border transition-all hover:bg-surface-secondary/20 hover:scale-[1.005] active:scale-95 block relative overflow-hidden',
                  isUnread
                    ? 'border-cn-purple/35 bg-cn-purple/[0.01]'
                    : 'border-[var(--border-light)]'
                )}
              >
                {/* User info & last msg preview */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="relative shrink-0">
                    <Avatar src={otherUser.avatar} alt={otherUser.name} size="md" />
                    {/* Unread check bubble dot */}
                    {isUnread && (
                      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-cn-purple border-2 border-surface-primary" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-text-primary truncate">
                        {otherUser.name}
                      </span>
                      {otherUser.isVerified && (
                        <BadgeCheck className="w-3.5 h-3.5 text-cn-blue fill-white shrink-0" />
                      )}
                      <span className="text-[9px] text-text-tertiary font-medium">
                        · {timeAgo(c.lastMessageAt)}
                      </span>
                    </div>

                    <p
                      className={cn(
                        'text-xs truncate max-w-xs',
                        isUnread ? 'text-text-primary font-bold' : 'text-text-secondary font-medium'
                      )}
                    >
                      {c.typingParticipantId === otherUser?.id ? (
                        <span className="text-cn-purple font-semibold italic animate-pulse">
                          Typing...
                        </span>
                      ) : lastMsg ? (
                        lastMsg.text
                      ) : (
                        'No messages yet'
                      )}
                    </p>
                  </div>
                </div>

                {/* Listing thumbnail/price chip indicator on the right */}
                {listing && (
                  <div className="ml-3 shrink-0 flex items-center gap-2">
                    <div className="relative w-12 h-10 rounded-lg overflow-hidden border border-[var(--border-light)]">
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 right-0 bg-black/60 px-1 py-0.5 rounded-tl-md text-[8px] font-bold text-white leading-none">
                        {formatNaira(listing.price / 1000)}k
                      </div>
                    </div>
                  </div>
                )}
              </Link>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
