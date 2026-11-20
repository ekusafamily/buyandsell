import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Cloudflare R2 Configuration from Environment Variables
const r2AccountId = import.meta.env.VITE_R2_ACCOUNT_ID || '';
const r2AccessKeyId = import.meta.env.VITE_R2_ACCESS_KEY_ID || '';
const r2SecretAccessKey = import.meta.env.VITE_R2_SECRET_ACCESS_KEY || '';
const r2BucketName = import.meta.env.VITE_R2_BUCKET_NAME || '';
const r2PublicDomain = import.meta.env.VITE_R2_PUBLIC_DOMAIN || '';
const r2UploadWorkerEndpoint = import.meta.env.VITE_R2_UPLOAD_ENDPOINT || '';

export const isR2Configured = Boolean(
  r2AccountId &&
  r2AccessKeyId &&
  r2SecretAccessKey &&
  r2BucketName &&
  !r2AccountId.includes('placeholder')
);

// S3 Client configured for Cloudflare R2
let s3Client: S3Client | null = null;

if (isR2Configured) {
  try {
    s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: r2AccessKeyId,
        secretAccessKey: r2SecretAccessKey,
      },
    });
  } catch (err) {
    console.error('Failed to initialize Cloudflare R2 S3 Client:', err);
  }
}

/**
 * Compress an image file to maintain snappy loading on mobile network for campus students
 */
export async function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const elem = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        elem.width = width;
        elem.height = height;
        const ctx = elem.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        elem.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (e) => reject(e);
    };
    reader.onerror = (e) => reject(e);
  });
}

/**
 * Convert a File/Blob to a local base64 Data URL (Used for offline/instant previews and fallback)
 */
export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Upload an image to Cloudflare R2
 * Falls back to local data URL or public endpoint if R2 is not fully configured
 */
export async function uploadListingImage(file: File, folder = 'listings'): Promise<string> {
  // Compress image to save bandwidth and storage
  const compressedBlob = await compressImage(file);
  const extension = file.name.split('.').pop() || 'jpg';
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`;

  // 1. Direct Presigned / Worker endpoint if configured
  if (r2UploadWorkerEndpoint) {
    try {
      const formData = new FormData();
      formData.append('file', compressedBlob, fileName);
      const res = await fetch(r2UploadWorkerEndpoint, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        return data.url;
      }
    } catch (e) {
      console.warn('Worker upload failed, trying direct R2 client', e);
    }
  }

  // 2. Direct S3 Client to Cloudflare R2
  if (isR2Configured && s3Client) {
    try {
      const arrayBuffer = await compressedBlob.arrayBuffer();
      const command = new PutObjectCommand({
        Bucket: r2BucketName,
        Key: fileName,
        Body: new Uint8Array(arrayBuffer),
        ContentType: 'image/jpeg',
      });

      await s3Client.send(command);

      // Return public R2 URL
      if (r2PublicDomain) {
        const cleanDomain = r2PublicDomain.replace(/\/$/, '');
        return `${cleanDomain}/${fileName}`;
      }
      return `https://${r2BucketName}.${r2AccountId}.r2.cloudflarestorage.com/${fileName}`;
    } catch (err) {
      console.error('Cloudflare R2 upload error:', err);
      // Fallback to data url so seller experience is not interrupted
      return await fileToDataUrl(compressedBlob);
    }
  }

  // 3. Fallback: Data URL so the app works seamlessly even without R2 credentials!
  return await fileToDataUrl(compressedBlob);
}

