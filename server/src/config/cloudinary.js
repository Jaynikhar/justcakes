import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';

let configured = false;

export function getCloudinary() {
  if (!configured) {
    cloudinary.config({
      cloud_name: env.cloudinary.cloudName,
      api_key: env.cloudinary.apiKey,
      api_secret: env.cloudinary.apiSecret,
      secure: true,
    });
    configured = true;
  }
  return cloudinary;
}

export function cloudinaryEnabled() {
  return (
    env.storageDriver === 'cloudinary' &&
    Boolean(env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret)
  );
}
