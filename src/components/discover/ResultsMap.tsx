'use client';

import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';
import type { ListingPost } from '@/data/mockData';

const ResultsMapInner = dynamic(() => import('./ResultsMapInner'), {
  ssr: false,
  loading: () => (
    <div className="relative h-[60vh] md:h-[70vh] rounded-2xl overflow-hidden glass-solid flex items-center justify-center animate-pulse">
      <div className="text-center">
        <MapPin className="w-12 h-12 text-text-tertiary mx-auto mb-3 animate-bounce" />
        <p className="text-sm text-text-secondary">Loading interactive map...</p>
      </div>
    </div>
  ),
});

interface ResultsMapProps {
  listings: ListingPost[];
  selectedUniversity: string | null;
}

export default function ResultsMap({ listings, selectedUniversity }: ResultsMapProps) {
  if (listings.length === 0) {
    return (
      <div className="relative h-[60vh] rounded-2xl glass-solid overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
          <p className="text-sm text-text-secondary">No listings to show on the map</p>
        </div>
      </div>
    );
  }

  return (
    <ResultsMapInner
      listings={listings}
      selectedUniversity={selectedUniversity}
    />
  );
}
