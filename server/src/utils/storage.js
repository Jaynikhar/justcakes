import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { cloudinaryEnabled, getCloudinary } from '../config/cloudinary.js';

const here = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_ROOT = path.resolve(here, '../../uploads');

const EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

function safeExtension(mimetype) {
  return EXTENSIONS[mimetype] || '.jpg';
}

/**
 * Saves a buffer either to Cloudinary or to the local uploads folder.
 * visibility: 'public' for product/slide/category images,
 *             'private' for payment screenshots.
 */
export async function saveImage(file, folder = 'products', visibility = 'public') {
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${safeExtension(file.mimetype)}`;

  if (cloudinaryEnabled()) {
    const cloudinary = getCloudinary();
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `just-cakes/${folder}`,
          resource_type: 'image',
          type: visibility === 'private' ? 'authenticated' : 'upload',
          public_id: filename.replace(/\.[a-z]+$/, ''),
        },
        (error, uploaded) => (error ? reject(error) : resolve(uploaded)),
      );
      stream.end(file.buffer);
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
      provider: 'cloudinary',
      visibility,
    };
  }

  const dir = path.join(UPLOAD_ROOT, visibility, folder);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), file.buffer);

  return {
    url: visibility === 'public' ? `/uploads/public/${folder}/${filename}` : null,
    publicId: `${visibility}/${folder}/${filename}`,
    provider: 'local',
    visibility,
  };
}

export async function deleteImage(image) {
  if (!image || !image.publicId) return;
  if (image.provider === 'cloudinary') {
    const cloudinary = getCloudinary();
    await cloudinary.uploader
      .destroy(image.publicId, { type: image.visibility === 'private' ? 'authenticated' : 'upload' })
      .catch(() => null);
    return;
  }
  await fs.unlink(path.join(UPLOAD_ROOT, image.publicId)).catch(() => null);
}

export function localPathFor(publicId) {
  return path.join(UPLOAD_ROOT, publicId);
}

export async function signedPrivateUrl(image) {
  if (!image || image.provider !== 'cloudinary') return null;
  const cloudinary = getCloudinary();
  return cloudinary.url(image.publicId, {
    type: 'authenticated',
    sign_url: true,
    secure: true,
    expires_at: Math.floor(Date.now() / 1000) + 600,
  });
}
