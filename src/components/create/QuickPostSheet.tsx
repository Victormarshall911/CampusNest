'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, CheckCircle, Plus, X, Search } from 'lucide-react';
import { formatNaira, cn } from '@/lib/utils';
import { universities, mockFeed, type ListingPost, type CampusUser } from '@/data/mockData';
import { mockPostStore } from '@/lib/mockPostStore';
import FilterSheet from '@/components/discover/FilterSheet';
import ProfileTabs from '@/components/profile/ProfileTabs';

interface QuickPostSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CampusUser;
  defaultTab?: 'review' | 'roommate';
}

export default function QuickPostSheet({
  isOpen,
  onClose,
  currentUser,
  defaultTab = 'review',
}: QuickPostSheetProps) {
  const [activeTab, setActiveTab] = useState<'review' | 'roommate'>(defaultTab);

  // Review Form States
  const [listingSearch, setListingSearch] = useState('');
  const [selectedListing, setSelectedListing] = useState<ListingPost | null>(null);
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');

  // Roommate Form States
  const [uniSearch, setUniSearch] = useState('');
  const [selectedUniId, setSelectedUniId] = useState('');
  const [budget, setBudget] = useState('');
  const [bio, setBio] = useState('');
  const [prefInput, setPrefInput] = useState('');
  const [preferences, setPreferences] = useState<string[]>(['Clean', 'Quiet']);

  // Success state
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Listing search matching listings in mockFeed + mockPostStore
  const allListings = useMemo(() => {
    const staticListings = mockFeed.filter((p): p is ListingPost => p.type === 'listing');
    const sessionListings = mockPostStore.getListings();
    return [...sessionListings, ...staticListings];
  }, []);

  const filteredListings = useMemo(() => {
    if (!listingSearch.trim()) return [];
    return allListings.filter(
      (l) =>
        l.title.toLowerCase().includes(listingSearch.toLowerCase()) ||
        l.area.toLowerCase().includes(listingSearch.toLowerCase())
    );
  }, [listingSearch, allListings]);

  // University matching
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

  // Star hover / click helper
  const handleStarClick = (val: number) => {
    setRating(val);
  };

  const handleStarHover = (val: number | null) => {
    setHoveredRating(val);
  };

  // Preference list additions
  const handleAddPreference = (e: React.FormEvent) => {
    e.preventDefault();
    if (prefInput.trim() && !preferences.includes(prefInput.trim())) {
      setPreferences((prev) => [...prev, prefInput.trim()]);
      setPrefInput('');
    }
  };

  const handleRemovePreference = (pref: string) => {
    setPreferences((prev) => prev.filter((p) => p !== pref));
  };

  // Forms validations
  const isFormValid = useMemo(() => {
    if (activeTab === 'review') {
      return selectedListing !== null && comment.trim().length > 10;
    } else {
      return selectedUniId !== '' && budget.trim().length > 0 && bio.trim().length > 10;
    }
  }, [activeTab, selectedListing, comment, selectedUniId, budget, bio]);

  // Handle post submit
  const handleSubmit = () => {
    if (!isFormValid) return;

    if (activeTab === 'review') {
      const newReview = {
        id: `session-review-${Date.now()}`,
        type: 'review' as const,
        author: {
          name: currentUser.name,
          avatar: currentUser.avatar,
          university: currentUser.universityShortName || 'Student',
        },
        landlordName: selectedListing!.landlord.name,
        area: selectedListing!.area,
        university: selectedListing!.university,
        rating: rating,
        title: `Verified review for ${selectedListing!.title}`,
        content: comment,
        images: [],
        likes: 0,
        comments: 0,
        createdAt: new Date().toISOString(),
        isLiked: false,
        isVerifiedTenant: true,
      };

      // Also append the review directly into the specific listing object so it shows up in Listing Detail
      const detailedReview = {
        id: `session-review-list-${Date.now()}`,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        verifiedTenant: true,
        rating: rating,
        comment: comment,
        date: new Date().toISOString(),
      };
      selectedListing!.reviews.unshift(detailedReview);

      mockPostStore.addReview(newReview);
      setToastMsg('Review posted successfully!');
    } else {
      const budgetNum = parseInt(budget.replace(/[^0-9]/g, ''), 10);
      const newRoommate = {
        id: `session-roommate-${Date.now()}`,
        type: 'roommate-request' as const,
        author: {
          name: currentUser.name,
          avatar: currentUser.avatar,
          university: currentUser.universityShortName || 'Student',
          level: currentUser.level || 'Student',
          department: currentUser.department || 'Academic',
        },
        university: selectedUni || universities[0],
        area: selectedUni?.areas[0] || 'Campus Area',
        budget: budgetNum,
        title: `Roommate wanted near ${selectedUni?.shortName || 'Campus'}`,
        description: bio,
        preferences: preferences,
        likes: 0,
        comments: 0,
        createdAt: new Date().toISOString(),
        isLiked: false,
      };

      mockPostStore.addRoommate(newRoommate);
      setToastMsg('Roommate request posted!');
    }

    // Show toast and close sheet
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      onClose();
      // Reset forms
      setListingSearch('');
      setSelectedListing(null);
      setComment('');
      setUniSearch('');
      setSelectedUniId('');
      setBudget('');
      setBio('');
    }, 1500);
  };

  const handleClear = () => {
    setListingSearch('');
    setSelectedListing(null);
    setComment('');
    setUniSearch('');
    setSelectedUniId('');
    setBudget('');
    setBio('');
  };

  return (
    <>
      <FilterSheet
        isOpen={isOpen}
        onClose={onClose}
        title="Create Quick Post"
        onApply={handleSubmit}
        onClear={handleClear}
      >
        <div className="space-y-4 pb-4">
          {/* Segment Toggle */}
          <ProfileTabs
            tabs={[
              { id: 'review', label: 'Write a Review' },
              { id: 'roommate', label: 'Roommate Request' },
            ]}
            active={activeTab}
            onChange={(tab) => {
              setActiveTab(tab as 'review' | 'roommate');
            }}
          />

          {/* ── REVIEW FORM ── */}
          {activeTab === 'review' && (
            <div className="space-y-4 pt-1">
              {/* Linked Listing Dropdown search */}
              <div className="space-y-1.5 relative">
                <label className="text-xs font-bold text-text-secondary flex items-center gap-1">
                  <Search className="w-3.5 h-3.5" />
                  Select property to review
                </label>
                <input
                  type="text"
                  value={selectedListing ? selectedListing.title : listingSearch}
                  onChange={(e) => {
                    setListingSearch(e.target.value);
                    setSelectedListing(null);
                  }}
                  placeholder="Type property title or area to search..."
                  className="w-full px-3 py-2.5 rounded-xl glass-solid border border-[var(--border-light)] text-xs text-text-primary outline-none focus:border-cn-purple/35 focus:ring-2 focus:ring-cn-purple/10 transition-all font-medium"
                />
                {filteredListings.length > 0 && !selectedListing && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-30 max-h-48 overflow-y-auto rounded-xl glass-solid border border-[var(--border-light)] shadow-xl p-1 space-y-0.5">
                    {filteredListings.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => {
                          setSelectedListing(l);
                          setListingSearch(l.title);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-surface-secondary rounded-lg text-[11px] font-medium text-text-primary flex items-center justify-between"
                      >
                        <span className="truncate">{l.title}</span>
                        <span className="text-[9px] text-text-tertiary font-bold shrink-0 ml-2">
                          {l.area}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Rating stars picker */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary block">Star Rating</label>
                <div className="flex items-center gap-1.5 py-1">
                  {Array.from({ length: 5 }).map((_, idx) => {
                    const starVal = idx + 1;
                    const isFilled = hoveredRating !== null ? starVal <= hoveredRating : starVal <= rating;
                    return (
                      <motion.button
                        key={idx}
                        type="button"
                        onClick={() => handleStarClick(starVal)}
                        onHoverStart={() => handleStarHover(starVal)}
                        onHoverEnd={() => handleStarHover(null)}
                        whileHover={{ scale: 1.25 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-neutral-200 cursor-pointer"
                      >
                        <Star
                          className={cn(
                            'w-7 h-7 transition-colors',
                            isFilled ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'
                          )}
                        />
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Review content */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary">Your review comment</label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your honest experience staying at this lodge. Generator conditions, water supply, security quality... Minimum 10 chars."
                  className="w-full px-3 py-2.5 rounded-xl glass-solid border border-[var(--border-light)] text-xs text-text-primary outline-none focus:border-cn-purple/35 focus:ring-2 focus:ring-cn-purple/10 transition-all font-medium resize-none"
                />
              </div>
            </div>
          )}

          {/* ── ROOMMATE REQUEST FORM ── */}
          {activeTab === 'roommate' && (
            <div className="space-y-4 pt-1">
              {/* Select University */}
              <div className="space-y-1.5 relative">
                <label className="text-xs font-bold text-text-secondary">Your University</label>
                <input
                  type="text"
                  value={uniSearch}
                  onChange={(e) => {
                    setUniSearch(e.target.value);
                    setSelectedUniId('');
                  }}
                  placeholder="Type university name or short code..."
                  className="w-full px-3 py-2.5 rounded-xl glass-solid border border-[var(--border-light)] text-xs text-text-primary outline-none focus:border-cn-purple/35 focus:ring-2 focus:ring-cn-purple/10 transition-all font-medium"
                />
                {filteredUnis.length > 0 && !selectedUniId && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-30 max-h-48 overflow-y-auto rounded-xl glass-solid border border-[var(--border-light)] shadow-xl p-1 space-y-0.5">
                    {filteredUnis.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          setSelectedUniId(u.id);
                          setUniSearch(u.name);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-surface-secondary rounded-lg text-[11px] font-medium text-text-primary flex items-center justify-between"
                      >
                        <span>{u.name}</span>
                        <span className="text-[9px] text-cn-purple bg-cn-purple/10 px-1.5 py-0.5 rounded font-bold shrink-0 ml-2">
                          {u.shortName}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Budget */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary">Your budget limit (₦)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="e.g. 150000"
                    className="w-full pl-8 pr-12 py-2.5 rounded-xl glass-solid border border-[var(--border-light)] text-xs text-text-primary outline-none focus:border-cn-purple/35 focus:ring-2 focus:ring-cn-purple/10 transition-all font-extrabold"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-text-secondary">
                    ₦
                  </span>
                  {budget && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-cn-purple bg-cn-purple/10 px-1.5 py-0.5 rounded font-bold">
                      {formatNaira(parseInt(budget, 10))}
                    </span>
                  )}
                </div>
              </div>

              {/* Description/Bio */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary">Short bio / roommate preferences</label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Introduce yourself. Department, department level, hobbies, cleaning habits, what you search for in a roommate... Minimum 10 chars."
                  className="w-full px-3 py-2.5 rounded-xl glass-solid border border-[var(--border-light)] text-xs text-text-primary outline-none focus:border-cn-purple/35 focus:ring-2 focus:ring-cn-purple/10 transition-all font-medium resize-none"
                />
              </div>

              {/* Preferences List Tags */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary">Roommate Preferences tags</label>
                <form onSubmit={handleAddPreference} className="flex gap-2">
                  <input
                    type="text"
                    value={prefInput}
                    onChange={(e) => setPrefInput(e.target.value)}
                    placeholder="e.g. Non-smoker, Studious"
                    className="flex-1 px-3 py-2 rounded-xl glass-solid border border-[var(--border-light)] text-[11px] text-text-primary outline-none focus:border-cn-purple/35 focus:ring-2 focus:ring-cn-purple/10 transition-all"
                  />
                  <button
                    type="submit"
                    className="px-3 rounded-xl gradient-bg text-white text-xs font-bold shadow flex items-center justify-center cursor-pointer animate-none"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </form>

                <div className="flex flex-wrap gap-1.5">
                  {preferences.map((pref) => (
                    <span
                      key={pref}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-secondary text-text-secondary text-[10px] font-semibold"
                    >
                      {pref}
                      <button
                        onClick={() => handleRemovePreference(pref)}
                        className="text-text-tertiary hover:text-cn-coral shrink-0"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Form Action Submit Button */}
          <div className="pt-2">
            <button
              onClick={handleSubmit}
              disabled={!isFormValid}
              className={cn(
                'w-full py-3 rounded-xl text-white text-xs font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer',
                isFormValid
                  ? 'gradient-bg shadow-md shadow-cn-purple/20 hover:brightness-115'
                  : 'bg-surface-secondary text-text-tertiary cursor-not-allowed'
              )}
            >
              <span>{activeTab === 'review' ? 'Post Review' : 'Post Roommate Request'}</span>
            </button>
          </div>
        </div>
      </FilterSheet>

      {/* Success quick post toast */}
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
                <p className="text-xs font-bold text-white">{toastMsg}</p>
                <p className="text-[10px] text-white/70">Reflected in feed & profile.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
