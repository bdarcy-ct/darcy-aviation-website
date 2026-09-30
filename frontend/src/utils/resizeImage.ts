// Shrinks phone-camera photos in the browser before upload: max 2000px on the
// long edge, re-encoded as JPEG. A 5 MB photo becomes ~400 KB, uploads never hit
// size limits, and visitors download a fraction of the data.
const MAX_EDGE = 2000;
const QUALITY = 0.85;

export async function resizeImage(file: File): Promise<File> {
  // Leave GIFs (animation), SVGs and small files alone
  if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') return file;
  if (file.size < 600 * 1024) return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' } as ImageBitmapOptions);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', QUALITY));
    if (!blob || blob.size >= file.size) return file;
    const base = file.name.replace(/\.[^.]+$/, '') || 'photo';
    return new File([blob], base + '.jpg', { type: 'image/jpeg', lastModified: Date.now() });
  } catch {
    // Formats the browser can't decode (e.g. HEIC outside Safari) upload as-is
    return file;
  }
}
