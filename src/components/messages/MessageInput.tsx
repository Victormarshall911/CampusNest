'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { SendHorizonal } from 'lucide-react';

interface MessageInputProps {
  onSend: (text: string) => void;
}

export default function MessageInput({ onSend }: MessageInputProps) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--background)]/90 backdrop-blur-md border-t border-[var(--border-light)] md:pl-64">
      <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
        {/* Chat input box */}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2.5 rounded-xl glass-solid border border-[var(--border-light)] text-xs font-semibold text-text-primary outline-none focus:border-cn-purple/35 focus:ring-2 focus:ring-cn-purple/10 transition-all"
        />

        {/* Send Button */}
        <motion.button
          type="button"
          onClick={handleSend}
          disabled={!text.trim()}
          whileTap={{ scale: text.trim() ? 0.85 : 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 10 }}
          className={`p-2.5 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            text.trim()
              ? 'gradient-bg text-white shadow-md shadow-cn-purple/15 hover:brightness-110'
              : 'bg-surface-secondary text-text-tertiary cursor-not-allowed'
          }`}
        >
          <SendHorizonal className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}
