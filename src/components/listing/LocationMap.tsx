'use client';

import { MapPin, ExternalLink, GraduationCap } from 'lucide-react';
import { formatNaira } from '@/lib/utils';
import { universities } from '@/data/mockData';

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

  // Find university coordinates to calculate pin offset
  const university = universities.find(
    (u) =>
      u.name.toLowerCase() === universityName.toLowerCase() ||
      u.shortName.toLowerCase() === universityName.toLowerCase() ||
      universityName.toLowerCase().includes(u.shortName.toLowerCase())
  );

  // Default offsets to center if university not found
  let pinLeft = 50;
  let pinTop = 50;

  if (university) {
    // Offset calculation: ~0.02 coordinate range mapped to 10% to 90% (40% max offset from center)
    // Scale factor: 40% / 0.02 = 2000
    const deltaLng = lng - university.lng;
    const deltaLat = lat - university.lat;
    
    pinLeft = Math.max(10, Math.min(90, 50 + deltaLng * 2000));
    pinTop = Math.max(10, Math.min(90, 50 - deltaLat * 2000)); // Lat is inverted in pixel coordinates
  }

  return (
    <div className="space-y-3">
      {/* Static Visual Map fallback styled box */}
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

        {/* University Marker at Center (50%, 50%) */}
        {university && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-white border border-[var(--border-light)] flex items-center justify-center shadow-md">
              <GraduationCap className="w-4 h-4 text-cn-purple" />
            </div>
            <span className="mt-1 text-[8px] font-bold text-cn-purple bg-white/80 px-1 py-0.5 rounded shadow-sm whitespace-nowrap">
              {university.shortName}
            </span>
          </div>
        )}

        {/* Target location concentric rings centered around the dynamically positioned pin */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${pinLeft}%`,
            top: `${pinTop}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="w-16 h-16 rounded-full border-2 border-cn-purple/10 animate-ping absolute -left-8 -top-8" />
          <div className="w-10 h-10 rounded-full border border-cn-purple/20 absolute -left-5 -top-5" />
          <div className="w-4 h-4 rounded-full bg-cn-purple/20 absolute -left-2 -top-2" />
        </div>

        {/* Dynamic price bubble pin */}
        <div
          className="absolute z-20"
          style={{
            left: `${pinLeft}%`,
            top: `${pinTop}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
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
