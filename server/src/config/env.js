import dotenv from 'dotenv';

dotenv.config();

const required = ['MONGO_URI', 'JWT_SECRET'];

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieName: process.env.COOKIE_NAME || 'jc_token',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  storageDriver: (process.env.STORAGE_DRIVER || 'local').toLowerCase(),
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  payment: {
    upiId: process.env.PAYMENT_UPI_ID || '',
    payeeName: process.env.PAYMENT_PAYEE_NAME || 'Just Cakes',
  },
  owner: {
    name: process.env.OWNER_NAME || 'Bakery Owner',
    username: process.env.OWNER_USERNAME || 'owner',
    email: process.env.OWNER_EMAIL || '',
    password: process.env.OWNER_PASSWORD || '',
    phone: process.env.OWNER_PHONE || '',
  },
  maxUploadBytes: 3 * 1024 * 1024,
};

export function assertEnv() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
