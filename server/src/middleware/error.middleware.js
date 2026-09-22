import multer from 'multer';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} does not exist`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong on our side';
  let details = err.details || null;

  if (err instanceof multer.MulterError) {
    statusCode = 400;
    message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'That image is too large. Use a file under 3 MB.'
        : 'That file could not be uploaded.';
  } else if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    details = Object.values(err.errors).map((item) => ({
      field: item.path,
      message: item.message,
    }));
    message = 'Some fields need to be corrected';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'That identifier is not valid';
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'value';
    message = `That ${field} is already in use`;
  }

  if (statusCode >= 500) {
    console.error('[error]', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    details,
    ...(env.isProd ? {} : { stack: err.stack }),
  });
}
