'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'solid' | 'flat';
  className?: string;
  onClick?: () => void;
  padding?: boolean;
}

export default function GlassCard({
  children,
  variant = 'default',
  className = '',
  onClick,
  padding = true,
}: GlassCardProps) {
  const variantClasses = {
    default: 'glass',
    elevated: 'glass-elevated',
    solid: 'glass-solid',
    flat: 'bg-surface-primary border border-[var(--border-light)]',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        variantClasses[variant],
        'rounded-2xl transition-all duration-300',
        padding && 'p-4',
        onClick && 'cursor-pointer hover:scale-[1.01] active:scale-[0.99]',
        className
      )}
    >
      {children}
    </div>
  );
}
