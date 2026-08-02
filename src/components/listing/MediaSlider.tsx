'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Share2, Bookmark, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface MediaSliderProps {
  images: string[];
  videoUrl?: string;
  title: string;
}

export default function MediaSlider({ images, videoUrl, title }: MediaSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, containScroll: 'trimSnaps' });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [saved, setSaved] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Combine video + images into one slides array
  const slides = useMemo(() => {
    const items = [];
    if (videoUrl) {
      items.push({ type: 'video', url: videoUrl });
    }
    images.forEach((img) => items.push({ type: 'image', url: img }));
    return items;
  }, [images, videoUrl]);

  // Track scroll position to update header background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 150);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const index = emblaApi.selectedScrollSnap();
    setSelectedIndex(index);

    // Auto-pause video if swiped away
    if (videoUrl && index !== 0 && videoRef.current) {
      videoRef.current.pause();
      setVideoPlaying(false);
    }
  }, [emblaApi, videoUrl]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi, onSelect]);

  const toggleVideo = () => {
    if (!videoRef.current) return;
    if (videoPlaying) {
      videoRef.current.pause();
      setVideoPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setVideoPlaying(true);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this listing on CampusNest: ${title}`,
          url: window.location.href,
        });
      } catch (err) {}
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="relative w-full aspect-[4/3] md:aspect-[16/9] max-h-[60vh] bg-neutral-900 overflow-hidden">
      {/* Embla Slider */}
      <div className="w-full h-full overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide, index) => (
            <div
              key={index}
              className="flex-[0_0_100%] min-w-0 h-full relative"
            >
              {slide.type === 'video' ? (
                <div className="relative w-full h-full flex items-center justify-center bg-black">
                  <video
                    ref={videoRef}
                    src={slide.url}
                    className="w-full h-full object-cover"
                    loop
                    muted={muted}
                    playsInline
                    onClick={toggleVideo}
                  />
                  {/* Video Controls overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <AnimatePresence>
                      {!videoPlaying && (
                        <motion.button
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center pointer-events-auto"
                          onClick={toggleVideo}
                        >
                          <Play className="w-6 h-6 text-white fill-white ml-1" />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                  {/* Mute toggle button */}
                  <button
                    onClick={() => setMuted(!muted)}
                    className="absolute bottom-4 right-4 p-2 rounded-full bg-black/55 backdrop-blur-sm text-white"
                  >
                    {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              ) : (
                <img
                  src={slide.url}
                  alt={`${title} - view ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Floating back and action buttons on scroll */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 md:pl-64',
          scrolled ? 'glass-nav py-3' : 'py-4 bg-transparent'
        )}
      >
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          {/* Back button */}
          <Link
            href="/discover"
            className={cn(
              'p-2.5 rounded-full transition-all active:scale-90',
              scrolled
                ? 'bg-surface-secondary text-text-primary hover:bg-surface-primary'
                : 'bg-black/30 backdrop-blur-md text-white hover:bg-black/45'
            )}
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          {/* Action pills */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className={cn(
                'p-2.5 rounded-full transition-all active:scale-90',
                scrolled
                  ? 'bg-surface-secondary text-text-primary'
                  : 'bg-black/30 backdrop-blur-md text-white'
              )}
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSaved(!saved)}
              className={cn(
                'p-2.5 rounded-full transition-all active:scale-90',
                scrolled
                  ? 'bg-surface-secondary'
                  : 'bg-black/30 backdrop-blur-md',
                saved ? 'text-cn-amber' : scrolled ? 'text-text-primary' : 'text-white'
              )}
            >
              <Bookmark className={cn('w-5 h-5', saved && 'fill-current')} />
            </button>
          </div>
        </div>
      </header>

      {/* Index counter badge overlay */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-4 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-semibold">
          {selectedIndex + 1}/{slides.length}
        </div>
      )}

      {/* Pagination dots overlay */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
          {slides.map((_, idx) => (
            <motion.div
              key={idx}
              animate={{
                width: idx === selectedIndex ? 18 : 6,
                opacity: idx === selectedIndex ? 1 : 0.4,
              }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="h-1.5 rounded-full bg-white shadow-sm"
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Extra helper for useMemo hook inside components
import { useMemo } from 'react';
