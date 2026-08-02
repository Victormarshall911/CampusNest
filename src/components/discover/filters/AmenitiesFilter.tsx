'use client';

import { motion } from 'motion/react';
import { Check, Wifi, Droplets, Shield, Zap, BatteryCharging, Grid3X3, PaintBucket, ShirtIcon, UtensilsCrossed, Bath, Car, Tv, Gauge, Lock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AmenitiesFilterProps {
  selected: string[];
  onChange: (amenities: string[]) => void;
}

const amenities = [
  { id: 'WiFi', label: 'WiFi', icon: Wifi },
  { id: 'Water Supply', label: 'Water Supply', icon: Droplets },
  { id: '24/7 Security', label: '24/7 Security', icon: Shield },
  { id: 'Generator', label: 'Generator', icon: Zap },
  { id: 'Inverter', label: 'Inverter', icon: BatteryCharging },
  { id: 'Tiled Floors', label: 'Tiled Floors', icon: Grid3X3 },
  { id: 'POP Ceiling', label: 'POP Ceiling', icon: PaintBucket },
  { id: 'Wardrobe', label: 'Wardrobe', icon: ShirtIcon },
  { id: 'Kitchen', label: 'Kitchen', icon: UtensilsCrossed },
  { id: 'Bathroom (En-suite)', label: 'En-suite Bath', icon: Bath },
  { id: 'Parking', label: 'Parking', icon: Car },
  { id: 'DSTV', label: 'DSTV', icon: Tv },
  { id: 'Prepaid Meter', label: 'Prepaid Meter', icon: Gauge },
  { id: 'Gated Compound', label: 'Gated Compound', icon: Lock },
  { id: 'Close to Campus', label: 'Near Campus', icon: MapPin },
];

export default function AmenitiesFilter({ selected, onChange }: AmenitiesFilterProps) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((a) => a !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-text-tertiary">
        Listings must have <strong>all</strong> selected amenities
      </p>
      <div className="flex flex-wrap gap-2">
        {amenities.map((amenity) => {
          const isActive = selected.includes(amenity.id);
          const Icon = amenity.icon;

          return (
            <motion.button
              key={amenity.id}
              whileTap={{ scale: 0.92 }}
              onClick={() => toggle(amenity.id)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all border',
                isActive
                  ? 'bg-cn-purple/10 border-cn-purple/25 text-cn-purple'
                  : 'bg-surface-secondary border-transparent text-text-secondary hover:bg-surface-primary'
              )}
            >
              <motion.div
                animate={isActive ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              >
                <Icon className="w-3.5 h-3.5" />
              </motion.div>
              {amenity.label}
              {isActive && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <Check className="w-3 h-3" strokeWidth={3} />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
