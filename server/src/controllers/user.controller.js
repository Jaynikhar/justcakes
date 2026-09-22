import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/ApiResponse.js';
import * as authService from '../services/auth.service.js';
import * as orderService from '../services/order.service.js';

export const getProfile = asyncHandler(async (req, res) => ok(res, { user: req.user.toPublic() }));

export const updateMyProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user._id, req.body);
  return ok(res, { user: user.toPublic() }, 'Profile updated');
});

export const changeMyPassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user._id, req.body.currentPassword, req.body.newPassword);
  return ok(res, null, 'Password changed');
});

export const myOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.listUserOrders(req.user._id);
  return ok(res, { orders });
});

export const myOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getUserOrder(req.user._id, req.params.id);
  return ok(res, { order });
});
