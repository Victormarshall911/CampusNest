'use client';

import { Wifi, Droplets, Shield, Zap, BatteryCharging, Grid3X3, PaintBucket, ShirtIcon, UtensilsCrossed, Bath, Car, Tv, Gauge, Lock, MapPin, Sparkles } from 'lucide-react';

const iconsMap: Record<string, typeof Wifi> = {
  'WiFi': Wifi,
  'Water Supply': Droplets,
  '24/7 Security': Shield,
  'Generator': Zap,
  'Inverter': BatteryCharging,
  'Tiled Floors': Grid3X3,
  'POP Ceiling': PaintBucket,
  'Wardrobe': ShirtIcon,
  'Kitchen': UtensilsCrossed,
  'Bathroom (En-suite)': Bath,
  'Parking': Car,
  'DSTV': Tv,
  'Prepaid Meter': Gauge,
  'Gated Compound': Lock,
  'Close to Campus': MapPin,
};

interface AmenitiesListProps {
  amenities: string[];
}

export default function AmenitiesList({ amenities }: AmenitiesListProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {amenities.map((item) => {
        const Icon = iconsMap[item] || Sparkles;
        return (
          <div
            key={item}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-surface-secondary text-text-primary"
          >
            <Icon className="w-4 h-4 text-cn-purple shrink-0" />
            <span className="text-xs font-medium">{item}</span>
          </div>
        );
      })}
    </div>
  );
}
