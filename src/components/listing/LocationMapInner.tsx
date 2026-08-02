'use client';

import AppMap from '@/components/shared/AppMap';
import MapPinMarker from '@/components/shared/MapPinMarker';

interface LocationMapInnerProps {
  lat: number;
  lng: number;
  price: number;
  area: string;
  universityName: string;
}

export default function LocationMapInner({
  lat,
  lng,
  price,
  area,
  universityName,
}: LocationMapInnerProps) {
  return (
    <div className="relative h-44 rounded-2xl overflow-hidden border border-[var(--border-light)] shadow-sm z-0">
      <AppMap center={[lat, lng]} zoom={15} interactive={false}>
        {/* Render Listing Pin at coordinates */}
        <MapPinMarker
          position={[lat, lng]}
          type="price"
          price={price}
          isSelected={true}
        />
      </AppMap>

      {/* Area tag info overlay */}
      <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-black/55 backdrop-blur-sm text-white text-[10px] font-semibold z-[400] pointer-events-none">
        {area} · near {universityName}
      </div>
    </div>
  );
}
