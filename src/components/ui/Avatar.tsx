'use client';

import { cn } from '@/lib/utils';
import { BadgeCheck } from 'lucide-react';

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  isVerified?: boolean;
  hasGradientBorder?: boolean;
  className?: string;
}

export default function Avatar({
  src,
  alt,
  size = 'md',
  isVerified = false,
  hasGradientBorder = false,
  className = '',
}: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const badgeSizes = {
    sm: 'w-3.5 h-3.5 -bottom-0.5 -right-0.5',
    md: 'w-4 h-4 -bottom-0.5 -right-0.5',
    lg: 'w-5 h-5 -bottom-0 -right-0',
  };

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      <div
        className={cn(
          'rounded-full overflow-hidden',
          sizeClasses[size],
          hasGradientBorder && 'p-[2px] bg-gradient-to-br from-cn-purple to-cn-blue'
        )}
      >
        <img
          src={src}
          alt={alt}
          className={cn(
            'w-full h-full rounded-full object-cover',
            hasGradientBorder && 'border-2 border-white'
          )}
          loading="lazy"
        />
      </div>
      {isVerified && (
        <div className={cn('absolute', badgeSizes[size])}>
          <BadgeCheck
            className="w-full h-full text-cn-blue fill-white drop-shadow-sm"
            strokeWidth={2.5}
          />
        </div>
      )}
    </div>
  );
}
