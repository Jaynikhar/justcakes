import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

/** Runs an express-validator chain array and converts failures into a 400. */
export function validate(chains) {
  return async (req, res, next) => {
    await Promise.all(chains.map((chain) => chain.run(req)));
    const result = validationResult(req);
    if (result.isEmpty()) return next();
    const details = result.array().map((item) => ({
      field: item.path,
      message: item.msg,
    }));
    return next(ApiError.badRequest('Some fields need to be corrected', details));
  };
}
