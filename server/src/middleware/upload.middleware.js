import multer from 'multer';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXT = /\.(jpe?g|png|webp)$/i;

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME.includes(file.mimetype)) {
    return cb(ApiError.badRequest('Only JPG, PNG or WEBP images are accepted'));
  }
  if (!ALLOWED_EXT.test(file.originalname || '')) {
    return cb(ApiError.badRequest('That file extension is not supported'));
  }
  return cb(null, true);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.maxUploadBytes, files: 5 },
});

export const uploadSingleImage = upload.single('image');
export const uploadProductImages = upload.array('images', 5);
export const uploadPaymentScreenshot = upload.single('paymentScreenshot');
