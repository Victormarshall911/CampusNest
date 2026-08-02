'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, X } from 'lucide-react';
import { formatNaira } from '@/lib/utils';
import type { ListingPost } from '@/data/mockData';
import { universities } from '@/data/mockData';
import AppMap from '@/components/shared/AppMap';
import MapPinMarker from '@/components/shared/MapPinMarker';

interface ResultsMapInnerProps {
  listings: ListingPost[];
  selectedUniversity: string | null;
}

// Preview card that appears when a pin is tapped
function ListingPreview({
  listing,
  onClose,
}: {
  listing: ListingPost;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="absolute bottom-4 left-4 right-4 z-[400]"
    >
      <div className="glass-elevated rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition-shadow">
        <Link href={`/listing/${listing.id}`} className="flex gap-3 p-3">
          {/* Image */}
          <div className="w-24 h-20 rounded-xl overflow-hidden shrink-0">
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-text-primary line-clamp-1">
              {listing.title}
            </h4>
            <div className="flex items-center gap-1 text-xs text-text-tertiary mt-0.5">
              <MapPin className="w-3 h-3" />
              <span>{listing.university.shortName} · {listing.area}</span>
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-sm font-bold gradient-text">
                {formatNaira(listing.price)}
                <span className="text-xs text-text-tertiary font-normal">{listing.priceLabel}</span>
              </span>
              <span className="text-xs font-medium text-cn-purple bg-cn-purple/10 px-2 py-0.5 rounded">
                {listing.roomType}
              </span>
            </div>
          </div>
          {/* Close */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="p-1 rounded-full hover:bg-surface-secondary self-start shrink-0"
          >
            <X className="w-4 h-4 text-text-tertiary" />
          </button>
        </Link>
      </div>
    </motion.div>
  );
}

export default function ResultsMapInner({ listings, selectedUniversity }: ResultsMapInnerProps) {
  const [selectedListing, setSelectedListing] = useState<ListingPost | null>(null);

  // Determine map center based on selected university
  const { center, zoom } = useMemo(() => {
    if (selectedUniversity) {
      const uni = universities.find((u) => u.id === selectedUniversity);
      if (uni) return { center: [uni.lat, uni.lng] as [number, number], zoom: 14 };
    }
    // Default: center of listings or center of Nigeria
    if (listings.length > 0) {
      const avgLat = listings.reduce((sum, l) => sum + l.lat, 0) / listings.length;
      const avgLng = listings.reduce((sum, l) => sum + l.lng, 0) / listings.length;
      return { center: [avgLat, avgLng] as [number, number], zoom: 12 };
    }
    return { center: [7.5, 4.5] as [number, number], zoom: 6 }; // Center of Nigeria
  }, [selectedUniversity, listings]);

  return (
    <div className="relative h-[60vh] md:h-[70vh] rounded-2xl overflow-hidden glass-solid z-0">
      <AppMap center={center} zoom={zoom}>
        {/* Render selected university center badge */}
        {selectedUniversity && (() => {
          const uni = universities.find((u) => u.id === selectedUniversity);
          if (!uni) return null;
          return (
            <MapPinMarker
              position={[uni.lat, uni.lng]}
              type="campus"
              shortName={uni.shortName}
            />
          );
        })()}

        {/* Render listing pins */}
        {listings.map((listing) => (
          <MapPinMarker
            key={listing.id}
            position={[listing.lat, listing.lng]}
            type="price"
            price={listing.price}
            isSelected={selectedListing?.id === listing.id}
            onClick={() =>
              setSelectedListing(
                selectedListing?.id === listing.id ? null : listing
              )
            }
          />
        ))}
      </AppMap>

      {/* Selected listing preview card overlay */}
      <AnimatePresence>
        {selectedListing && (
          <ListingPreview
            listing={selectedListing}
            onClose={() => setSelectedListing(null)}
          />
        )}
      </AnimatePresence>

      {/* Map legend */}
      <div className="absolute top-3 right-3 z-[400] pointer-events-none">
        <div className="glass-solid rounded-xl p-2.5 text-[10px] font-semibold text-text-secondary shadow-md flex flex-col gap-1.5 border border-white/40 pointer-events-auto">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full gradient-bg border border-white shadow-sm shrink-0" />
            <span>Campus</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-md bg-white border border-[var(--border-light)] flex items-center justify-center shadow-sm shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-cn-purple" />
            </div>
            <span>Lodge</span>
          </div>
        </div>
      </div>
    </div>
  );
}
