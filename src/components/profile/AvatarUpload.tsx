'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Camera } from 'lucide-react';
import { uploadMedia } from '@/lib/uploadMedia';
import Avatar from '@/components/ui/Avatar';

interface AvatarUploadProps {
  userId: string;
  currentAvatar: string | null;
  userName: string;
  onUpdateSuccess?: (newUrl: string) => void;
}

export default function AvatarUpload({
  userId,
  currentAvatar,
  userName,
  onUpdateSuccess,
}: AvatarUploadProps) {
  const { update } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleAvatarClick = () => {
    if (uploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('Image must be under 50MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // 1. Upload directly from the browser to Cloudinary
      const result = await uploadMedia(file, {
        onProgress: (progressEvent) => {
          setProgress(progressEvent.percentage);
        },
      });

      // 2. Save avatarUrl to local database
      const res = await fetch(`/api/users/${userId}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          avatarUrl: result.url,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update avatar in database');
      }

      // 3. Update session credentials cache
      await update({
        avatarUrl: result.url,
      });

      // Notify parent about update completion
      onUpdateSuccess?.(result.url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to upload avatar');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={uploading}
      />

      {/* Avatar Container with Glass Border Ring overlay */}
      <div className="relative rounded-full overflow-hidden border-2 border-transparent group-hover:border-cn-purple transition-all shadow-md">
        <Avatar
          src={currentAvatar || ''}
          alt={userName}
          size="lg"
          className="!w-20 !h-20 object-cover"
        />

        {/* Uploading progress overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex flex-col items-center justify-center text-white">
            <div className="w-6 h-6 rounded-full border-2 border-t-cn-purple border-neutral-600 animate-spin mb-1" />
            <span className="text-[9px] font-black">{progress}%</span>
          </div>
        )}

        {/* Hover Camera Overlay */}
        {!uploading && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
            <Camera className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Error Tooltip overlay */}
      {error && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2 py-0.5 rounded bg-cn-coral text-white text-[9px] font-bold whitespace-nowrap shadow-md z-30">
          {error}
        </div>
      )}
    </div>
  );
}
