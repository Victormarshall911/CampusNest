'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, X } from 'lucide-react';
import { formatNaira, cn } from '@/lib/utils';
import type { ListingPost } from '@/data/mockData';
import { universities } from '@/data/mockData';

interface ResultsMapProps {
  listings: ListingPost[];
  selectedUniversity: string | null;
}

/**
 * Map view component — renders an interactive map with listing pins.
 *
 * NOTE: This uses a CSS-based map visualization as a fallback.
 * To enable the full Mapbox GL map:
 * 1. Get a free token from https://account.mapbox.com/
 * 2. Set NEXT_PUBLIC_MAPBOX_TOKEN in .env.local
 * 3. Uncomment the react-map-gl import and MapboxMap component below
 */

// Pin price bubble component
function PricePin({
  listing,
  isSelected,
  onClick,
}: {
  listing: ListingPost;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      initial={{ scale: 0, y: 10 }}
      animate={{ scale: 1, y: 0 }}
      whileHover={{ scale: 1.1, zIndex: 50 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      onClick={onClick}
      className={cn(
        'absolute px-2 py-1 rounded-lg text-xs font-bold shadow-lg transition-colors cursor-pointer whitespace-nowrap z-10',
        isSelected
          ? 'gradient-bg text-white scale-110 shadow-cn-purple/30'
          : 'bg-white text-text-primary border border-[var(--border-light)] hover:border-cn-purple/30'
      )}
      style={{ transform: 'translate(-50%, -50%)' }}
    >
      {formatNaira(listing.price / 1000)}k
      <div className={cn(
        'absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45',
        isSelected ? 'gradient-bg' : 'bg-white border-r border-b border-[var(--border-light)]'
      )} />
    </motion.button>
  );
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
      className="absolute bottom-4 left-4 right-4 z-50"
    >
      <div className="glass-elevated rounded-2xl overflow-hidden">
        <div className="flex gap-3 p-3">
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
            onClick={onClose}
            className="p-1 rounded-full hover:bg-surface-secondary self-start shrink-0"
          >
            <X className="w-4 h-4 text-text-tertiary" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function ResultsMap({ listings, selectedUniversity }: ResultsMapProps) {
  const [selectedListing, setSelectedListing] = useState<ListingPost | null>(null);

  // Determine map center based on selected university
  const center = useMemo(() => {
    if (selectedUniversity) {
      const uni = universities.find((u) => u.id === selectedUniversity);
      if (uni) return { lat: uni.lat, lng: uni.lng };
    }
    // Default: center of Nigeria (or first university with listings)
    if (listings.length > 0) {
      const avgLat = listings.reduce((sum, l) => sum + l.lat, 0) / listings.length;
      const avgLng = listings.reduce((sum, l) => sum + l.lng, 0) / listings.length;
      return { lat: avgLat, lng: avgLng };
    }
    return { lat: 7.5, lng: 4.5 }; // Center of Nigeria
  }, [selectedUniversity, listings]);

  // Calculate bounds for pin positioning
  const bounds = useMemo(() => {
    if (listings.length === 0) return { minLat: center.lat - 0.05, maxLat: center.lat + 0.05, minLng: center.lng - 0.05, maxLng: center.lng + 0.05 };

    const lats = listings.map((l) => l.lat);
    const lngs = listings.map((l) => l.lng);
    const padding = 0.01;
    return {
      minLat: Math.min(...lats) - padding,
      maxLat: Math.max(...lats) + padding,
      minLng: Math.min(...lngs) - padding,
      maxLng: Math.max(...lngs) + padding,
    };
  }, [listings, center]);

  // Convert lat/lng to pixel position within map container
  const toPosition = useCallback(
    (lat: number, lng: number) => {
      const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
      const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 100;
      return {
        left: `${Math.max(5, Math.min(95, x))}%`,
        top: `${Math.max(5, Math.min(95, y))}%`,
      };
    },
    [bounds]
  );

  // Group nearby pins for clustering
  const clustered = useMemo(() => {
    if (listings.length <= 20) return { singles: listings, clusters: [] as { count: number; lat: number; lng: number; listings: ListingPost[] }[] };

    const clusterRadius = 0.005; // ~500m
    const used = new Set<string>();
    const singles: ListingPost[] = [];
    const clusters: { count: number; lat: number; lng: number; listings: ListingPost[] }[] = [];

    listings.forEach((listing) => {
      if (used.has(listing.id)) return;
      const nearby = listings.filter(
        (other) =>
          !used.has(other.id) &&
          Math.abs(other.lat - listing.lat) < clusterRadius &&
          Math.abs(other.lng - listing.lng) < clusterRadius
      );
      if (nearby.length > 2) {
        nearby.forEach((n) => used.add(n.id));
        const avgLat = nearby.reduce((s, n) => s + n.lat, 0) / nearby.length;
        const avgLng = nearby.reduce((s, n) => s + n.lng, 0) / nearby.length;
        clusters.push({ count: nearby.length, lat: avgLat, lng: avgLng, listings: nearby });
      } else {
        used.add(listing.id);
        singles.push(listing);
      }
    });

    return { singles, clusters };
  }, [listings]);

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
    <div className="relative h-[60vh] md:h-[70vh] rounded-2xl overflow-hidden glass-solid">
      {/* Map background — styled CSS map */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at ${50}% ${50}%, rgba(108, 60, 225, 0.06) 0%, transparent 50%),
            linear-gradient(180deg, #f0f4ff 0%, #e8eef8 50%, #dde6f0 100%)
          `,
        }}
      >
        {/* Grid lines for map feel */}
        <div className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.15) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* University marker */}
        {selectedUniversity && (() => {
          const uni = universities.find((u) => u.id === selectedUniversity);
          if (!uni) return null;
          const pos = toPosition(uni.lat, uni.lng);
          return (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
              className="absolute z-20"
              style={{ left: pos.left, top: pos.top, transform: 'translate(-50%, -50%)' }}
            >
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center shadow-lg shadow-cn-purple/30 border-2 border-white">
                  <span className="text-white text-[8px] font-bold">{uni.shortName.slice(0, 3)}</span>
                </div>
                <span className="mt-1 text-[10px] font-semibold text-cn-purple bg-white/80 px-1.5 py-0.5 rounded shadow-sm">
                  {uni.shortName}
                </span>
              </div>
            </motion.div>
          );
        })()}

        {/* Cluster pins */}
        {clustered.clusters.map((cluster, i) => {
          const pos = toPosition(cluster.lat, cluster.lng);
          return (
            <motion.div
              key={`cluster-${i}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: i * 0.05 }}
              className="absolute z-20"
              style={{ left: pos.left, top: pos.top, transform: 'translate(-50%, -50%)' }}
            >
              <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-cn-purple/30 border-2 border-white cursor-pointer hover:scale-110 transition-transform">
                {cluster.count}
              </div>
            </motion.div>
          );
        })}

        {/* Individual listing pins */}
        {clustered.singles.map((listing) => {
          const pos = toPosition(listing.lat, listing.lng);
          return (
            <div
              key={listing.id}
              className="absolute"
              style={{ left: pos.left, top: pos.top }}
            >
              <PricePin
                listing={listing}
                isSelected={selectedListing?.id === listing.id}
                onClick={() =>
                  setSelectedListing(
                    selectedListing?.id === listing.id ? null : listing
                  )
                }
              />
            </div>
          );
        })}
      </div>

      {/* Selected listing preview card */}
      <AnimatePresence>
        {selectedListing && (
          <ListingPreview
            listing={selectedListing}
            onClose={() => setSelectedListing(null)}
          />
        )}
      </AnimatePresence>

      {/* Map legend */}
      <div className="absolute top-3 right-3 z-30">
        <div className="glass-solid rounded-lg px-3 py-2 text-[10px] text-text-secondary space-y-1">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full gradient-bg border border-white" />
            <span>University</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-1.5 rounded bg-white border border-[var(--border-light)]" />
            <span>Listing</span>
          </div>
        </div>
      </div>
    </div>
  );
}
