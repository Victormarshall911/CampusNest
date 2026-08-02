'use client';

import dynamic from 'next/dynamic';
import { ExternalLink, MapPin } from 'lucide-react';

const LocationMapInner = dynamic(() => import('./LocationMapInner'), {
  ssr: false,
  loading: () => (
    <div className="relative h-44 rounded-2xl overflow-hidden border border-[var(--border-light)] shadow-sm flex items-center justify-center bg-surface-secondary animate-pulse">
      <div className="text-center">
        <MapPin className="w-8 h-8 text-text-tertiary mx-auto mb-2 animate-bounce" />
        <p className="text-[10px] text-text-secondary">Loading map location...</p>
      </div>
    </div>
  ),
});

interface LocationMapProps {
  lat: number;
  lng: number;
  price: number;
  area: string;
  universityName: string;
}

export default function LocationMap({
  lat,
  lng,
  price,
  area,
  universityName,
}: LocationMapProps) {
  // Deep link to Google Maps
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <div className="space-y-3">
      {/* Client-side only interactive map */}
      <LocationMapInner
        lat={lat}
        lng={lng}
        price={price}
        area={area}
        universityName={universityName}
      />

      {/* Deep Link to Google Maps */}
      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-surface-secondary text-text-primary hover:bg-surface-primary border border-[var(--border-light)] text-xs font-semibold transition-colors"
      >
        <ExternalLink className="w-3.5 h-3.5 text-text-secondary" />
        Open in Google Maps
      </a>
    </div>
  );
}
