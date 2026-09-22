import { Review } from '../models/Review.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { recalculateRating } from './product.service.js';

const ELIGIBLE_STATUSES = ['COMPLETED', 'OUT_FOR_DELIVERY', 'PICKED_UP'];

export async function listProductReviews(productId, { limit = 20 } = {}) {
  return Review.find({ productId, isApproved: true })
    .sort({ createdAt: -1 })
    .limit(Math.min(Number(limit) || 20, 100));
}

export async function listLatestReviews(limit = 12) {
  return Review.find({ isApproved: true }).sort({ createdAt: -1 }).limit(limit);
}

export async function listAllReviews() {
  return Review.find().sort({ createdAt: -1 });
}

/** A user may review a product only after an eligible order containing it. */
export async function findEligibleOrder(userId, productId) {
  return Order.findOne({
    userId,
    status: { $in: ELIGIBLE_STATUSES },
    'items.productId': productId,
  }).sort({ createdAt: -1 });
}

export async function checkEligibility(userId, productId) {
  const order = await findEligibleOrder(userId, productId);
  if (!order) return { eligible: false, reason: 'NO_DELIVERED_ORDER', orderId: null };

  const existing = await Review.findOne({ userId, productId, orderId: order._id });
  if (existing) return { eligible: false, reason: 'ALREADY_REVIEWED', orderId: order._id };

  return { eligible: true, reason: null, orderId: order._id };
}

export async function createReview(user, payload) {
  const product = await Product.findById(payload.productId);
  if (!product) throw ApiError.notFound('That cake is not on the menu');

  const order = await Order.findById(payload.orderId);
  if (!order) throw ApiError.notFound('That order does not exist');
  if (String(order.userId) !== String(user._id)) throw ApiError.forbidden();
  if (!ELIGIBLE_STATUSES.includes(order.status)) {
    throw ApiError.forbidden('You can rate a cake once the order has been completed');
  }
  const ordered = order.items.some((item) => String(item.productId) === String(product._id));
  if (!ordered) throw ApiError.forbidden('That cake was not part of this order');

  const duplicate = await Review.findOne({
    userId: user._id,
    productId: product._id,
    orderId: order._id,
  });
  if (duplicate) throw ApiError.conflict('You already rated this cake for this order');

  const review = await Review.create({
    userId: user._id,
    productId: product._id,
    orderId: order._id,
    userNameSnapshot: user.name, // name comes from the account, not the request
    productNameSnapshot: product.name,
    rating: Number(payload.rating),
    description: payload.description,
    isApproved: true,
  });

  await recalculateRating(product._id);
  return review;
}

export async function updateReview(user, reviewId, payload) {
  const review = await Review.findById(reviewId);
  if (!review) throw ApiError.notFound('That review does not exist');

  const isAuthor = String(review.userId) === String(user._id);
  const isOwner = user.role === 'OWNER';
  if (!isAuthor && !isOwner) throw ApiError.forbidden();

  if (payload.rating !== undefined && isAuthor) review.rating = Number(payload.rating);
  if (payload.description !== undefined && isAuthor) review.description = payload.description;
  if (payload.isApproved !== undefined && isOwner) {
    review.isApproved = payload.isApproved === 'false' ? false : Boolean(payload.isApproved);
  }

  await review.save();
  await recalculateRating(review.productId);
  return review;
}

export async function deleteReview(user, reviewId) {
  const review = await Review.findById(reviewId);
  if (!review) throw ApiError.notFound('That review does not exist');

  const isAuthor = String(review.userId) === String(user._id);
  if (!isAuthor && user.role !== 'OWNER') throw ApiError.forbidden();

  const { productId } = review;
  await review.deleteOne();
  await recalculateRating(productId);
  return { id: reviewId };
}
