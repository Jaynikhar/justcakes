import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyToken } from '../utils/generateToken.js';
import { User } from '../models/User.js';

function extractToken(req) {
  if (req.cookies && req.cookies[env.cookieName]) return req.cookies[env.cookieName];
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7);
  return null;
}

/** Rejects the request when there is no valid session. */
export const authenticate = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized();

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw ApiError.unauthorized('Your session expired. Sign in again.');
  }

  const user = await User.findById(payload.sub);
  if (!user) throw ApiError.unauthorized('Your session expired. Sign in again.');

  req.user = user;
  next();
});

/** Attaches req.user when a session exists, but never blocks the request. */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const payload = verifyToken(token);
    req.user = await User.findById(payload.sub);
  } catch {
    req.user = undefined;
  }
  return next();
});
