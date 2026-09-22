import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/ApiResponse.js';
import * as dashboardService from '../services/dashboard.service.js';
import * as orderService from '../services/order.service.js';

export const summary = asyncHandler(async (req, res) => {
  const data = await dashboardService.getSummary();
  return ok(res, { summary: data });
});

export const sales = asyncHandler(async (req, res) => {
  const data = await dashboardService.getSalesReport(req.query);
  return ok(res, { sales: data });
});

export const orders = asyncHandler(async (req, res) => {
  const result = await orderService.listAllOrders(req.query);
  return ok(res, { orders: result.items }, 'OK', {
    total: result.total,
    page: result.page,
    pages: result.pages,
  });
});

export const publicStats = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getPublicStats();
  return ok(res, { stats });
});
