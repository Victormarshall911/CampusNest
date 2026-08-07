export interface UploadProgressEvent {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadOptions {
  onProgress?: (progress: UploadProgressEvent) => void;
  xhrRef?: (xhr: XMLHttpRequest) => void;
}

/**
 * Uploads a file directly from the browser to Cloudinary's unsigned upload API.
 * Abuses no server bandwidth and reports progress back to the caller.
 */
export async function uploadMedia(
  file: File,
  options?: UploadOptions
): Promise<{ url: string; type: 'IMAGE' | 'VIDEO' }> {
  // Reject files over 50MB immediately
  if (file.size > 50 * 1024 * 1024) {
    throw new Error('File exceeds the maximum size limit of 50MB.');
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset || uploadPreset === 'placeholder_preset') {
    throw new Error('Cloudinary cloud name or upload preset is not configured in .env.local.');
  }

  const isVideo = file.type.startsWith('video/');
  const mediaType = isVideo ? 'VIDEO' : 'IMAGE';

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    // Pass XMLHttpRequest reference to options so caller can abort it
    if (options?.xhrRef) {
      options.xhrRef(xhr);
    }

    xhr.open(
      'POST',
      `https://api.cloudinary.com/v1_1/${cloudName}/${isVideo ? 'video' : 'image'}/upload`
    );

    // Track upload progress
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && options?.onProgress) {
        const percentage = Math.round((e.loaded / e.total) * 100);
        options.onProgress({
          loaded: e.loaded,
          total: e.total,
          percentage,
        });
      }
    };

    // Load handlers
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          if (res.secure_url) {
            resolve({
              url: res.secure_url,
              type: mediaType,
            });
          } else {
            reject(new Error('Cloudinary response missing secure URL.'));
          }
        } catch {
          reject(new Error('Failed to parse Cloudinary response JSON.'));
        }
      } else {
        try {
          const errRes = JSON.parse(xhr.responseText);
          reject(new Error(errRes.error?.message || `Upload failed with status ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network connection error.'));
    };

    xhr.onabort = () => {
      reject(new Error('Upload aborted.'));
    };

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    xhr.send(formData);
  });
}
