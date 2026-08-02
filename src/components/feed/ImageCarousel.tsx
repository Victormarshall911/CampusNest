'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface ImageCarouselProps {
  images: string[];
  alt: string;
  onDoubleTap?: () => void;
}

export default function ImageCarousel({ images, alt, onDoubleTap }: ImageCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    dragFree: false,
    containScroll: 'trimSnaps',
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showHeart, setShowHeart] = useState(false);
  const lastTapRef = useRef(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const index = emblaApi.selectedScrollSnap();
    setSelectedIndex(index);
    // Preload adjacent images
    setLoadedImages(prev => {
      const next = new Set(prev);
      next.add(index);
      if (index > 0) next.add(index - 1);
      if (index < images.length - 1) next.add(index + 1);
      return next;
    });
  }, [emblaApi, images.length]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap detected
      setShowHeart(true);
      onDoubleTap?.();
      setTimeout(() => setShowHeart(false), 800);
    }
    lastTapRef.current = now;
  }, [onDoubleTap]);

  if (images.length === 0) {
    return (
      <div className="w-full aspect-[4/3] bg-surface-secondary flex items-center justify-center">
        <span className="text-text-tertiary text-sm">No images</span>
      </div>
    );
  }

  return (
    <div className="relative w-full" onClick={handleTap}>
      {/* Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {images.map((img, index) => (
            <div
              key={index}
              className="flex-[0_0_100%] min-w-0 relative aspect-[4/3]"
            >
              {loadedImages.has(index) ? (
                <img
                  src={img}
                  alt={`${alt} - photo ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              ) : (
                <div className="w-full h-full skeleton" style={{ borderRadius: 0 }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Image counter badge */}
      {images.length > 1 && (
        <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-medium">
          {selectedIndex + 1}/{images.length}
        </div>
      )}

      {/* Pagination dots */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {images.map((_, index) => (
            <motion.div
              key={index}
              animate={{
                width: index === selectedIndex ? 20 : 6,
                opacity: index === selectedIndex ? 1 : 0.5,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={cn(
                'h-1.5 rounded-full',
                index === selectedIndex
                  ? 'bg-white shadow-sm'
                  : 'bg-white/70'
              )}
            />
          ))}
        </div>
      )}

      {/* Double-tap heart animation */}
      <AnimatePresence>
        {showHeart && (
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 15,
            }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <svg
              className="w-24 h-24 text-white drop-shadow-lg"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
