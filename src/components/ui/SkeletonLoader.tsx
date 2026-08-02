'use client';

export default function SkeletonLoader() {
  return (
    <div className="glass-solid rounded-2xl overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="skeleton w-full aspect-[4/3]" style={{ borderRadius: 0 }} />

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Header: avatar + name */}
        <div className="flex items-center gap-3">
          <div className="skeleton w-10 h-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3.5 w-32" />
            <div className="skeleton h-2.5 w-24" />
          </div>
        </div>

        {/* Price */}
        <div className="skeleton h-5 w-28" />

        {/* Description lines */}
        <div className="space-y-2">
          <div className="skeleton h-3 w-full" />
          <div className="skeleton h-3 w-3/4" />
        </div>

        {/* Action bar */}
        <div className="flex items-center gap-4 pt-1">
          <div className="skeleton h-6 w-6 rounded-full" />
          <div className="skeleton h-6 w-6 rounded-full" />
          <div className="skeleton h-6 w-6 rounded-full" />
          <div className="flex-1" />
          <div className="skeleton h-6 w-6 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonFeed({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4 px-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonLoader key={i} />
      ))}
    </div>
  );
}
