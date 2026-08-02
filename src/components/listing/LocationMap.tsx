'use client';

import { MapPin, ExternalLink } from 'lucide-react';
import { formatNaira } from '@/lib/utils';

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
      {/* Static Visual Map FALLBACK styled box */}
      <div
        className="relative h-44 rounded-2xl overflow-hidden border border-[var(--border-light)] shadow-sm"
        style={{
          background: `
            radial-gradient(circle at 50% 50%, rgba(108, 60, 225, 0.08) 0%, transparent 60%),
            linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)
          `,
        }}
      >
        {/* Map visual grid lines */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.15) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px',
          }}
        />

        {/* Target location concentric rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full border-2 border-cn-purple/10 animate-ping absolute" />
          <div className="w-10 h-10 rounded-full border border-cn-purple/20 absolute" />
          <div className="w-4 h-4 rounded-full bg-cn-purple/20 absolute" />
        </div>

        {/* Center styled price bubble pin */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="px-2.5 py-1 rounded-xl gradient-bg text-white text-xs font-bold shadow-lg shadow-cn-purple/35 flex items-center gap-1 whitespace-nowrap">
            <MapPin className="w-3.5 h-3.5 fill-white text-cn-purple" />
            <span>{formatNaira(price / 1000)}k</span>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 gradient-bg rotate-45" />
          </div>
        </div>

        {/* Area tag info overlay */}
        <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-black/55 backdrop-blur-sm text-white text-[10px] font-semibold">
          {area} · near {universityName}
        </div>
      </div>

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
