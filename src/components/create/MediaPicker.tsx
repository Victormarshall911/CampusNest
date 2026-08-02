'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UploadCloud, X, Play, ArrowLeft, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectedMedia {
  id: string;
  file: File;
  previewUrl: string;
  type: 'image' | 'video';
}

interface MediaPickerProps {
  media: SelectedMedia[];
  onChange: (media: SelectedMedia[]) => void;
  error?: string;
  setError?: (err: string | undefined) => void;
}

export default function MediaPicker({
  media,
  onChange,
  error,
  setError,
}: MediaPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (files: File[]) => {
    setError?.(undefined);

    const newMedia: SelectedMedia[] = [...media];

    for (const file of files) {
      if (newMedia.length >= 10) {
        setError?.('Maximum of 10 media files allowed.');
        break;
      }

      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isVideo) {
        setError?.('Only image or video files are accepted.');
        continue;
      }

      newMedia.push({
        id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        type: isImage ? 'image' : 'video',
      });
    }

    onChange(newMedia);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleRemove = (id: string, previewUrl: string) => {
    setError?.(undefined);
    URL.revokeObjectURL(previewUrl);
    const updated = media.filter((m) => m.id !== id);
    onChange(updated);
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const newMedia = [...media];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= media.length) return;

    // Swap items
    const temp = newMedia[index];
    newMedia[index] = newMedia[targetIndex];
    newMedia[targetIndex] = temp;

    onChange(newMedia);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const triggerPicker = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Large Glass Dropzone */}
      {media.length < 10 && (
        <motion.div
          onClick={triggerPicker}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          whileTap={{ scale: 0.98 }}
          className={cn(
            'flex flex-col items-center justify-center p-8 rounded-2xl glass border-2 border-dashed cursor-pointer transition-all text-center',
            isDragOver
              ? 'border-cn-purple bg-cn-purple/10 scale-[1.01]'
              : 'border-[var(--border-medium)] hover:border-cn-purple/40 hover:bg-surface-secondary/30'
          )}
        >
          <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center text-white mb-3 shadow-lg shadow-cn-purple/20">
            <UploadCloud className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-sm font-bold text-text-primary mb-1">
            Upload room photos & videos
          </h3>
          <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
            Drag and drop files here, or tap to browse your gallery
          </p>
          <span className="text-[10px] text-text-tertiary mt-2">
            Supports Images & Videos (Max 10 files · First is Cover)
          </span>
        </motion.div>
      )}

      {/* Validation Warning Messaging */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-xl bg-cn-coral/10 border border-cn-coral/20 text-cn-coral text-xs font-semibold leading-relaxed"
        >
          {error}
        </motion.div>
      )}

      {/* Media Preview Grid */}
      {media.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-text-tertiary font-bold uppercase tracking-wider">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Files selected ({media.length}/10)</span>
          </div>

          <div className="grid grid-cols-2 xs:grid-cols-3 gap-3">
            <AnimatePresence mode="popLayout">
              {media.map((item, index) => {
                const isCover = index === 0;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    className={cn(
                      'relative aspect-[4/3] rounded-xl overflow-hidden glass border shadow-sm group',
                      isCover ? 'border-cn-purple ring-2 ring-cn-purple/20' : 'border-[var(--border-light)]'
                    )}
                  >
                    {/* Media Thumbnail */}
                    {item.type === 'video' ? (
                      <div className="w-full h-full relative bg-neutral-900 flex items-center justify-center">
                        <video src={item.previewUrl} className="w-full h-full object-cover opacity-80" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                          <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white">
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={item.previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    )}

                    {/* Cover Badge */}
                    {isCover && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-cn-purple text-white text-[9px] font-bold tracking-wider uppercase shadow-sm">
                        Cover Photo
                      </div>
                    )}

                    {/* Index Badge */}
                    {!isCover && (
                      <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white text-[9px] font-bold">
                        {index + 1}
                      </div>
                    )}

                    {/* Actions Overlay (Visible on Hover/Focus) */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                      {/* Top actions */}
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemove(item.id, item.previewUrl)}
                          className="w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-cn-coral hover:text-white transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Reordering buttons */}
                      <div className="flex justify-center gap-1.5">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => handleMove(index, 'left')}
                            className="w-7 h-7 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-cn-purple hover:scale-105 transition-all cursor-pointer"
                          >
                            <ArrowLeft className="w-4 h-4" />
                          </button>
                        )}
                        {index < media.length - 1 && (
                          <button
                            type="button"
                            onClick={() => handleMove(index, 'right')}
                            className="w-7 h-7 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-cn-purple hover:scale-105 transition-all cursor-pointer"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
