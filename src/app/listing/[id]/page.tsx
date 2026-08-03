'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  MapPin,
  Sparkles,
  ShieldCheck,
  FileText,
  BadgeAlert,
  GraduationCap,
  Scale,
  Star,
  Compass,
} from 'lucide-react';
import { getListingById } from '@/lib/getListingById';
import { formatNaira } from '@/lib/utils';
import type { ListingPost } from '@/data/mockData';

// Component Imports
import MediaSlider from '@/components/listing/MediaSlider';
import ExpandableSection from '@/components/listing/ExpandableSection';
import AmenitiesList from '@/components/listing/AmenitiesList';
import LandlordCard from '@/components/listing/LandlordCard';
import LocationMap from '@/components/listing/LocationMap';
import ReviewsSection from '@/components/listing/ReviewsSection';
import StickyBottomBar from '@/components/listing/StickyBottomBar';

export default function ListingDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [listing, setListing] = useState<ListingPost | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulate lookup fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      const data = getListingById(id);
      if (data) {
        setListing(data);
      }
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [id]);

  // Loading Skeleton State
  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] pb-24 md:pl-0">
        {/* Media slider skeleton */}
        <div className="skeleton w-full aspect-[4/3] md:aspect-[16/9] max-h-[60vh]" style={{ borderRadius: 0 }} />

        {/* Content Skeleton */}
        <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
          <div className="space-y-3">
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-7 w-3/4" />
            <div className="skeleton h-4 w-32" />
          </div>
          <div className="skeleton h-24 w-full rounded-2xl" />
          <div className="space-y-2">
            <div className="skeleton h-10 w-full" />
            <div className="skeleton h-10 w-full" />
            <div className="skeleton h-10 w-full" />
          </div>
        </div>
      </main>
    );
  }

  // Lodge Not Found state
  if (!listing) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[var(--background)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className="max-w-sm space-y-6"
        >
          <div className="w-20 h-20 rounded-2xl glass-solid border border-cn-coral/20 flex items-center justify-center mx-auto text-cn-coral">
            <BadgeAlert className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-text-primary" style={{ fontFamily: 'var(--font-display)' }}>
              Lodge Not Found
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              This listing might have been rented out or removed by the landlord. Let&apos;s get you back to listings.
            </p>
          </div>
          <Link
            href="/discover"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white gradient-bg font-semibold shadow-lg shadow-cn-purple/20"
          >
            <Compass className="w-4 h-4" />
            Explore Other Lodges
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] pb-24 md:pl-0">
      {/* Parallax Media Slider (Photos + Optional Video) */}
      <MediaSlider
        images={listing.images}
        videoUrl={listing.videoUrl}
        title={listing.title}
      />

      {/* Detail Body */}
      <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
        {/* Title specs & price card overlay */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cn-purple/10 text-cn-purple">
              {listing.roomType}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cn-blue/10 text-cn-blue flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" />
              {listing.university.shortName}
            </span>
            {listing.landlord.isVerified && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cn-green/10 text-cn-green flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Listing
              </span>
            )}
          </div>

          <h1 className="text-xl font-extrabold text-text-primary leading-snug" style={{ fontFamily: 'var(--font-display)' }}>
            {listing.title}
          </h1>

          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
            <MapPin className="w-4 h-4 text-text-tertiary shrink-0" />
            <span>{listing.area} · {listing.distance}</span>
          </div>

          {/* Pricing Box details */}
          <div className="p-4 rounded-2xl bg-surface-secondary/70 border border-[var(--border-light)] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider block">
                Total Rent
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold gradient-text">
                  {formatNaira(listing.price)}
                </span>
                <span className="text-xs text-text-secondary">{listing.priceLabel}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-text-tertiary block">Likes</span>
              <span className="text-sm font-bold text-text-primary">
                {listing.likes} students liked
              </span>
            </div>
          </div>
        </div>

        {/* Accordion Sections details */}
        <div className="space-y-1">
          {/* Description Section */}
          <ExpandableSection
            title="Description"
            icon={<FileText className="w-5 h-5" />}
            defaultExpanded
          >
            <p>{listing.description}</p>
          </ExpandableSection>

          {/* Amenities Section */}
          <ExpandableSection
            title="Amenities"
            icon={<Sparkles className="w-5 h-5" />}
            defaultExpanded
          >
            <AmenitiesList amenities={listing.amenities} />
          </ExpandableSection>

          {/* House Rules Section */}
          <ExpandableSection
            title="House Rules"
            icon={<Scale className="w-5 h-5" />}
          >
            <ul className="space-y-2 pl-1">
              {listing.houseRules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-cn-purple mt-1.5 shrink-0" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </ExpandableSection>

          {/* Reviews Section Accordion */}
          <ExpandableSection
            title={`Reviews (${listing.reviews.length})`}
            icon={<Star className="w-5 h-5" />}
          >
            <ReviewsSection reviews={listing.reviews} />
          </ExpandableSection>
        </div>

        {/* Location maps */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
            Location Profile
          </h3>
          <LocationMap
            lat={listing.lat}
            lng={listing.lng}
            price={listing.price}
            area={listing.area}
            universityName={listing.university.name}
          />
        </div>

        {/* Landlord Card profile */}
        <div className="space-y-3 pt-3">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
            Lessor Info
          </h3>
          <LandlordCard landlord={listing.landlord} />
        </div>
      </div>

      {/* Sticky Bottom details bar */}
      <StickyBottomBar
        price={listing.price}
        priceLabel={listing.priceLabel}
        landlordId={listing.landlord.id}
        landlordName={listing.landlord.name}
        listingId={listing.id}
      />
    </main>
  );
}
