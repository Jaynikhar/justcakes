import { ApiError } from '../utils/ApiError.js';

/** Role check that reads only from the authenticated server-side user. */
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden());
    return next();
  };
}
