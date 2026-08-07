'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  CheckCircle,
  GraduationCap,
  MapPin,
  Tag,
  Plus,
  X,
  Map,
} from 'lucide-react';
import { formatNaira, cn } from '@/lib/utils';
import { universities } from '@/data/mockData';
import MediaPicker, { type SelectedMedia } from '@/components/create/MediaPicker';
import LocationMap from '@/components/listing/LocationMap';

const roomTypes = ['Self-Contain', 'Shared Room', '1-Bedroom', 'Mini Flat', '2-Bedroom', 'Hostel Bed', 'Studio'];
const amenitiesList = [
  'WiFi', 'Water Supply', '24/7 Security', 'Generator', 'Inverter',
  'Tiled Floors', 'POP Ceiling', 'Wardrobe', 'Kitchen', 'Bathroom (En-suite)',
  'Parking', 'DSTV', 'Prepaid Meter', 'Gated Compound', 'Close to Campus'
];

function getRandomOffset(center: number): number {
  return center + (Math.random() - 0.5) * 0.02;
}

interface CreatePostWizardProps {
  currentUserId: string;
}

export default function CreatePostWizard({ currentUserId }: CreatePostWizardProps) {
  const router = useRouter();

  // Wizard Navigation State
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Media Step State
  const [media, setMedia] = useState<SelectedMedia[]>([]);
  const [mediaError, setMediaError] = useState<string | undefined>(undefined);

  // Basics Step State
  const [title, setTitle] = useState('');
  const [uniSearch, setUniSearch] = useState('');
  const [selectedUniId, setSelectedUniId] = useState('');
  const [area, setArea] = useState('');
  const [roomType, setRoomType] = useState(roomTypes[0]);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  // Details Step State
  const [rawPrice, setRawPrice] = useState('');
  const [priceLabel, setPriceLabel] = useState('/year');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [ruleInput, setRuleInput] = useState('');
  const [houseRules, setHouseRules] = useState<string[]>(['No loud music after 10 PM']);

  // Success States
  const [publishing, setPublishing] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // ── Basics Helpers ──────────────────────────────────────────────────────────
  const filteredUnis = useMemo(() => {
    if (!uniSearch.trim()) return [];
    return universities.filter(
      (u) =>
        u.name.toLowerCase().includes(uniSearch.toLowerCase()) ||
        u.shortName.toLowerCase().includes(uniSearch.toLowerCase())
    );
  }, [uniSearch]);

  const selectedUni = useMemo(() => {
    return universities.find((u) => u.id === selectedUniId);
  }, [selectedUniId]);

  const handleSelectUni = (uniId: string) => {
    setSelectedUniId(uniId);
    const uni = universities.find((u) => u.id === uniId);
    if (uni) {
      setUniSearch(uni.name);
      // Generate randomized property lat/lng offsets within the university area
      setLat(getRandomOffset(uni.lat));
      setLng(getRandomOffset(uni.lng));
    }
  };

  const shuffleCoordinates = () => {
    if (selectedUni) {
      setLat(getRandomOffset(selectedUni.lat));
      setLng(getRandomOffset(selectedUni.lng));
    }
  };

  // ── Details Helpers ──────────────────────────────────────────────────────────
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numeric = e.target.value.replace(/[^0-9]/g, '');
    setRawPrice(numeric);
  };

  const formattedPriceDisplay = useMemo(() => {
    if (!rawPrice) return '₦0';
    return formatNaira(parseInt(rawPrice, 10));
  }, [rawPrice]);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (ruleInput.trim() && !houseRules.includes(ruleInput.trim())) {
      setHouseRules((prev) => [...prev, ruleInput.trim()]);
      setRuleInput('');
    }
  };

  const handleRemoveRule = (rule: string) => {
    setHouseRules((prev) => prev.filter((r) => r !== rule));
  };

  // ── Validation ──────────────────────────────────────────────────────────────
  const isStepValid = useMemo(() => {
    switch (step) {
      case 1:
        return media.length > 0;
      case 2:
        return title.trim().length > 3 && selectedUniId !== '' && area.trim().length > 2;
      case 3:
        return rawPrice !== '' && parseInt(rawPrice, 10) > 0 && description.trim().length > 10;
      default:
        return true;
    }
  }, [step, media.length, title, selectedUniId, area, rawPrice, description]);

  // ── Wizard Navigation ───────────────────────────────────────────────────────
  const handleNext = () => {
    if (isStepValid && step < totalSteps) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((s) => s - 1);
    }
  };

  // ── Publish ────────────────────────────────────────────────────────────────
  const handlePublish = async () => {
    if (publishing) return;
    setPublishing(true);

    const priceNum = parseInt(rawPrice, 10);
    const listingImages = media.map((m) => m.previewUrl);

    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          price: priceNum,
          priceLabel,
          roomType,
          lat: Number(lat) || undefined,
          lng: Number(lng) || undefined,
          area,
          amenities: selectedAmenities,
          houseRules,
          images: listingImages.length > 0 ? listingImages : undefined,
          universityId: selectedUni?.id || 'unilag',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to publish listing');
      }

      const data = await res.json();
      setPublishing(false);
      setShowToast(true);

      setTimeout(() => {
        setShowToast(false);
        router.push(`/listing/${data.id}`);
        router.refresh();
      }, 2000);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Something went wrong publishing listing');
      setPublishing(false);
    }
  };

  return (
    <div className="relative flex flex-col min-h-[calc(100vh-80px)] md:min-h-0 bg-transparent py-4 max-w-xl mx-auto px-4">
      {/* Step Indicators Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <span className="text-[10px] text-text-tertiary uppercase font-extrabold tracking-wider">
            List a lodge · Step {step} of {totalSteps}
          </span>
          <h1 className="text-lg font-black text-text-primary" style={{ fontFamily: 'var(--font-display)' }}>
            {step === 1 && 'Upload lodge media'}
            {step === 2 && 'Basics information'}
            {step === 3 && 'Lodge details & rules'}
            {step === 4 && 'Preview & Publish'}
          </h1>
        </div>

        {/* Progress Bar Dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div
              key={idx}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                step === idx + 1 ? 'w-6 gradient-bg' : 'w-2 bg-surface-secondary'
              )}
            />
          ))}
        </div>
      </div>

      {/* Dynamic Slide Steps Content */}
      <div className="flex-1 min-h-0 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -25 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="pb-24 space-y-6"
          >
            {/* ── STEP 1: MEDIA UPLOAD ── */}
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-xs text-text-secondary leading-relaxed">
                  Provide high-quality photos and videos of your apartment so potential tenants can inspect the interior and exterior online.
                </p>
                <MediaPicker
                  media={media}
                  onChange={setMedia}
                  error={mediaError}
                  setError={setMediaError}
                />
              </div>
            )}

            {/* ── STEP 2: BASICS INFO ── */}
            {step === 2 && (
              <div className="space-y-5">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary">Property title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Executive Single Room Self-Contain"
                    className="w-full px-3 py-2.5 rounded-xl glass-solid border border-[var(--border-light)] text-sm text-text-primary outline-none focus:border-cn-purple/35 focus:ring-2 focus:ring-cn-purple/10 transition-all font-medium"
                  />
                </div>

                {/* University Selector */}
                <div className="space-y-1.5 relative">
                  <label className="text-xs font-bold text-text-secondary">Nearest University</label>
                  <input
                    type="text"
                    value={uniSearch}
                    onChange={(e) => {
                      setUniSearch(e.target.value);
                      setSelectedUniId('');
                    }}
                    placeholder="Search for a Nigerian university..."
                    className="w-full px-3 py-2.5 rounded-xl glass-solid border border-[var(--border-light)] text-sm text-text-primary outline-none focus:border-cn-purple/35 focus:ring-2 focus:ring-cn-purple/10 transition-all font-medium"
                  />
                  {filteredUnis.length > 0 && !selectedUniId && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-30 max-h-48 overflow-y-auto rounded-xl glass-solid border border-[var(--border-light)] shadow-xl p-1 space-y-0.5">
                      {filteredUnis.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => handleSelectUni(u.id)}
                          className="w-full text-left px-3 py-2 hover:bg-surface-secondary rounded-lg text-xs font-medium text-text-primary flex items-center justify-between"
                        >
                          <span>{u.name}</span>
                          <span className="text-[10px] text-cn-purple bg-cn-purple/10 px-1.5 py-0.5 rounded font-bold">
                            {u.shortName}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Area Location Text */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary">Area / Neighbourhood</label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. Yaba Akoka, near Gate"
                    className="w-full px-3 py-2.5 rounded-xl glass-solid border border-[var(--border-light)] text-sm text-text-primary outline-none focus:border-cn-purple/35 focus:ring-2 focus:ring-cn-purple/10 transition-all font-medium"
                  />
                </div>

                {/* Room Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary">Room type</label>
                  <div className="grid grid-cols-2 xs:grid-cols-3 gap-2">
                    {roomTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => setRoomType(type)}
                        className={cn(
                          'px-3 py-2 rounded-xl text-xs font-semibold text-center border transition-all active:scale-95 cursor-pointer',
                          roomType === type
                            ? 'gradient-bg text-white border-transparent shadow-md'
                            : 'bg-surface-secondary border-[var(--border-light)] text-text-secondary hover:text-text-primary'
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pin Placement on fallback LocationMap */}
                {selectedUniId && lat && lng && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-text-secondary flex items-center gap-1">
                        <Map className="w-3.5 h-3.5 text-cn-purple" />
                        Interactive map preview (simulated coordinates)
                      </span>
                      <button
                        onClick={shuffleCoordinates}
                        className="text-[10px] font-bold text-cn-purple hover:underline"
                      >
                        Shuffle Pin position
                      </button>
                    </div>

                    <LocationMap
                      lat={lat}
                      lng={lng}
                      price={media.length > 0 ? 300000 : 0} // visual helper price
                      area={area || 'Area'}
                      universityName={selectedUni?.name || 'University'}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 3: DETAILS & RULES ── */}
            {step === 3 && (
              <div className="space-y-5">
                {/* Price */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary">Rent price (₦)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={rawPrice}
                      onChange={handlePriceChange}
                      placeholder="e.g. 250000"
                      className="w-full pl-8 pr-20 py-2.5 rounded-xl glass-solid border border-[var(--border-light)] text-sm text-text-primary outline-none focus:border-cn-purple/35 focus:ring-2 focus:ring-cn-purple/10 transition-all font-extrabold"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-extrabold text-text-secondary">
                      ₦
                    </span>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                      <span className="text-[10px] text-cn-purple bg-cn-purple/10 px-2 py-1 rounded font-bold">
                        {formattedPriceDisplay}
                      </span>
                      <select
                        value={priceLabel}
                        onChange={(e) => setPriceLabel(e.target.value)}
                        className="bg-transparent text-xs text-text-secondary font-semibold outline-none cursor-pointer"
                      >
                        <option value="/year">/yr</option>
                        <option value="/month">/mo</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary">Short description</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the state of the room, lighting conditions, security, etc. Minimum 10 chars."
                    className="w-full px-3 py-2.5 rounded-xl glass-solid border border-[var(--border-light)] text-sm text-text-primary outline-none focus:border-cn-purple/35 focus:ring-2 focus:ring-cn-purple/10 transition-all font-medium resize-none"
                  />
                </div>

                {/* Amenities */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary">Lodge amenities</label>
                  <div className="flex flex-wrap gap-2">
                    {amenitiesList.map((amenity) => {
                      const selected = selectedAmenities.includes(amenity);
                      return (
                        <button
                          key={amenity}
                          onClick={() => toggleAmenity(amenity)}
                          className={cn(
                            'px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 cursor-pointer',
                            selected
                              ? 'gradient-bg text-white'
                              : 'bg-surface-secondary text-text-secondary hover:text-text-primary'
                          )}
                        >
                          <Tag className="w-3 h-3" />
                          {amenity}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* House Rules */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary">House rules</label>
                  <form onSubmit={handleAddRule} className="flex gap-2">
                    <input
                      type="text"
                      value={ruleInput}
                      onChange={(e) => setRuleInput(e.target.value)}
                      placeholder="e.g. No smoking in compound"
                      className="flex-1 px-3 py-2 rounded-xl glass-solid border border-[var(--border-light)] text-xs text-text-primary outline-none focus:border-cn-purple/35 focus:ring-2 focus:ring-cn-purple/10 transition-all"
                    />
                    <button
                      type="submit"
                      className="px-3 rounded-xl gradient-bg text-white text-xs font-bold shadow flex items-center justify-center cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </form>

                  <div className="flex flex-wrap gap-1.5">
                    {houseRules.map((rule) => (
                      <span
                        key={rule}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-secondary text-text-secondary text-[10px] font-semibold"
                      >
                        {rule}
                        <button
                          onClick={() => handleRemoveRule(rule)}
                          className="text-text-tertiary hover:text-cn-coral shrink-0"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 4: PREVIEW & PUBLISH ── */}
            {step === 4 && (
              <div className="space-y-5">
                <p className="text-xs text-text-secondary leading-relaxed">
                  Review how your lodge will be displayed on the Home feed and Discover results.
                </p>

                {/* Visual Preview Card matching FeedCard visual structure */}
                <div className="glass-solid rounded-2xl overflow-hidden border border-cn-purple/20 shadow-xl max-w-sm mx-auto">
                  {/* Thumbnail / Image Carousel mock */}
                  <div className="relative aspect-[4/3] bg-neutral-900 overflow-hidden">
                    <img
                      src={media[0]?.previewUrl}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-black/55 backdrop-blur-sm text-white text-xs font-bold">
                      {formattedPriceDisplay}
                      <span className="text-[10px] text-white/70 font-normal">{priceLabel}</span>
                    </div>

                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-cn-purple text-white text-[8px] font-extrabold uppercase tracking-wide">
                      Preview
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold text-cn-purple bg-cn-purple/10 px-2 py-0.5 rounded">
                        {roomType}
                      </span>
                      <span className="text-[9px] font-bold text-cn-blue bg-cn-blue/10 px-2 py-0.5 rounded flex items-center gap-0.5">
                        <GraduationCap className="w-2.5 h-2.5" />
                        {selectedUni?.shortName}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-text-primary line-clamp-1">
                      {title || 'Listing Title'}
                    </h3>

                    <div className="flex items-center gap-1 text-[10px] text-text-secondary">
                      <MapPin className="w-3.5 h-3.5 text-text-tertiary" />
                      <span>{area} · 0.5km from campus</span>
                    </div>

                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                      {description || 'Lodge description placeholder...'}
                    </p>

                    <div className="pt-2 border-t border-[var(--border-light)] flex flex-wrap gap-1">
                      {selectedAmenities.slice(0, 3).map((a) => (
                        <span key={a} className="text-[8px] font-bold text-text-secondary bg-surface-secondary px-1.5 py-0.5 rounded">
                          {a}
                        </span>
                      ))}
                      {selectedAmenities.length > 3 && (
                        <span className="text-[8px] font-bold text-text-tertiary px-1 py-0.5">
                          +{selectedAmenities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-cn-purple/5 border border-cn-purple/10 flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-cn-purple shrink-0" />
                  <p className="text-[10px] text-text-secondary leading-relaxed">
                    By publishing, this listing will be dynamically injected into the in-memory feeds. It resets on refresh.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--background)]/90 backdrop-blur-md border-t border-[var(--border-light)] md:pl-64">
        <div className="max-w-xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          {/* Back Button */}
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-[var(--border-medium)] text-text-secondary hover:text-text-primary text-xs font-semibold transition-all active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {/* Next / Publish Button */}
          {step < totalSteps ? (
            <button
              onClick={handleNext}
              disabled={!isStepValid}
              className={cn(
                'flex items-center gap-1 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all active:scale-95 cursor-pointer',
                isStepValid
                  ? 'gradient-bg shadow-md shadow-cn-purple/20'
                  : 'bg-surface-secondary text-text-tertiary cursor-not-allowed'
              )}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-white gradient-bg text-xs font-black shadow-lg shadow-cn-purple/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              {publishing ? 'Publishing...' : 'Publish Listing'}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Success Publish Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 z-50 md:w-80"
          >
            <div className="p-4 rounded-xl bg-neutral-900/95 backdrop-blur-md text-white shadow-2xl flex items-center gap-3 border border-white/10">
              <div className="w-8 h-8 rounded-full bg-cn-green/20 flex items-center justify-center text-cn-green shrink-0">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white">Listing published successfully!</p>
                <p className="text-[10px] text-white/70">Redirecting to page...</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
