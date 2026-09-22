import { asyncHandler } from '../utils/asyncHandler.js';
import { created, ok } from '../utils/ApiResponse.js';
import * as reviewService from '../services/review.service.js';

export const listForProduct = asyncHandler(async (req, res) => {
  const reviews = await reviewService.listProductReviews(req.params.productId, req.query);
  return ok(res, { reviews });
});

export const listLatest = asyncHandler(async (req, res) => {
  const reviews = await reviewService.listLatestReviews(Number(req.query.limit) || 12);
  return ok(res, { reviews });
});

export const listAll = asyncHandler(async (req, res) => {
  const reviews = await reviewService.listAllReviews();
  return ok(res, { reviews });
});

export const eligibility = asyncHandler(async (req, res) => {
  const result = await reviewService.checkEligibility(req.user._id, req.params.productId);
  return ok(res, result);
});

export const create = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview(req.user, req.body);
  return created(res, { review }, 'Thanks for rating this cake');
});

export const update = asyncHandler(async (req, res) => {
  const review = await reviewService.updateReview(req.user, req.params.id, req.body);
  return ok(res, { review }, 'Review updated');
});

export const remove = asyncHandler(async (req, res) => {
  const result = await reviewService.deleteReview(req.user, req.params.id);
  return ok(res, result, 'Review deleted');
});
