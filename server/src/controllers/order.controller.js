import fs from 'fs';
import { asyncHandler } from '../utils/asyncHandler.js';
import { created, ok } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { Order } from '../models/Order.js';
import { localPathFor, signedPrivateUrl } from '../utils/storage.js';
import * as orderService from '../services/order.service.js';

export const place = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.user, req.body, req.file);
  return created(res, { order }, 'Order placed');
});

export const listMine = asyncHandler(async (req, res) => {
  const orders = await orderService.listUserOrders(req.user._id);
  return ok(res, { orders });
});

export const detailMine = asyncHandler(async (req, res) => {
  const order = await orderService.getUserOrder(req.user._id, req.params.id);
  return ok(res, { order });
});

export const listAll = asyncHandler(async (req, res) => {
  const result = await orderService.listAllOrders(req.query);
  return ok(res, { orders: result.items }, 'OK', {
    total: result.total,
    page: result.page,
    pages: result.pages,
  });
});

export const detailForOwner = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderForOwner(req.params.id);
  return ok(res, { order });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatus(
    req.params.id,
    req.body.status,
    req.body.note || '',
  );
  return ok(res, { order }, 'Status updated');
});

export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const order = await orderService.setPaymentStatus(req.params.id, req.body.paymentStatus);
  return ok(res, { order }, 'Payment status updated');
});

/** Payment screenshots are streamed only to the buyer or the bakery owner. */
export const paymentScreenshot = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('That order does not exist');

  const isOwner = req.user.role === 'OWNER';
  const isBuyer = String(order.userId) === String(req.user._id);
  if (!isOwner && !isBuyer) throw ApiError.forbidden();
  if (!order.paymentScreenshot) throw ApiError.notFound('No payment screenshot on this order');

  if (order.paymentScreenshot.provider === 'cloudinary') {
    const url = await signedPrivateUrl(order.paymentScreenshot);
    return res.redirect(url);
  }

  const filePath = localPathFor(order.paymentScreenshot.publicId);
  if (!fs.existsSync(filePath)) throw ApiError.notFound('That screenshot file is missing');

  res.setHeader('Cache-Control', 'private, no-store');
  return res.sendFile(filePath);
});
