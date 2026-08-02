'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import SearchBar from '@/components/discover/SearchBar';
import FilterChips from '@/components/discover/FilterChips';
import ResultsToggle from '@/components/discover/ResultsToggle';
import ResultsGrid from '@/components/discover/ResultsGrid';
import ResultsMap from '@/components/discover/ResultsMap';
import { filterListings, defaultFilters, type Filters } from '@/lib/filterListings';
import { mockFeed, type ListingPost } from '@/data/mockData';
import { mockPostStore } from '@/lib/mockPostStore';

export default function DiscoverPage() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [view, setView] = useState<'grid' | 'map'>('grid');
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<ListingPost[]>(() => {
    const staticListings = mockFeed.filter((p): p is ListingPost => p.type === 'listing');
    const sessionListings = mockPostStore.getListings();
    return [...sessionListings, ...staticListings];
  });

  // Sync listings on mount + store changes
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);

    const unsubscribe = mockPostStore.subscribe(() => {
      // Re-query latest listing sources
      const staticListings = mockFeed.filter((p): p is ListingPost => p.type === 'listing');
      const sessionListings = mockPostStore.getListings();
      setListings([...sessionListings, ...staticListings]);
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  // Filter results — instant since it's all client-side mock data
  const results = useMemo(() => filterListings(listings, filters), [listings, filters]);

  const handleSearchChange = (query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  };

  const handleClearFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <main className="min-h-screen">
      {/* Sticky header area */}
      <div className="sticky top-0 z-40 md:z-30">
        <div className="glass-nav px-4 pt-3 pb-2 border-b border-[var(--border-light)]">
          <div className="max-w-5xl mx-auto space-y-3">
            {/* Top bar with title */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center shadow-md shadow-cn-purple/20 md:hidden">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                  <span className="gradient-text">Discover</span>
                </h1>
              </div>
              <ResultsToggle view={view} onChange={setView} />
            </div>

            {/* Search bar */}
            <SearchBar value={filters.searchQuery} onChange={handleSearchChange} />

            {/* Filter chips */}
            <FilterChips filters={filters} onFiltersChange={setFilters} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-4">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="glass-solid rounded-xl overflow-hidden">
                <div className="skeleton aspect-[4/3]" style={{ borderRadius: 0 }} />
                <div className="p-2.5 space-y-2">
                  <div className="skeleton h-3 w-16" />
                  <div className="skeleton h-3 w-full" />
                  <div className="skeleton h-2.5 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            key={view}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {view === 'grid' ? (
              <ResultsGrid listings={results} onClearFilters={handleClearFilters} />
            ) : (
              <ResultsMap listings={results} selectedUniversity={filters.university} />
            )}
          </motion.div>
        )}
      </div>
    </main>
  );
}
