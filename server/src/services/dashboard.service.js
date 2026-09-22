import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { User } from '../models/User.js';

const COMPLETED_SALES = { $nin: ['CANCELLED'] };

function startOfDay(date = new Date()) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export async function getSummary() {
  const now = new Date();
  const dayStart = startOfDay(now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const [
    totalOrders,
    dailyOrders,
    monthlyOrders,
    yearlyOrders,
    pendingOrders,
    salesAgg,
    monthlySalesAgg,
    totalCustomers,
    totalProducts,
    totalCategories,
    byStatus,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: dayStart } }),
    Order.countDocuments({ createdAt: { $gte: monthStart } }),
    Order.countDocuments({ createdAt: { $gte: yearStart } }),
    Order.countDocuments({ status: { $in: ['ORDER_RECEIVED', 'BAKING'] } }),
    Order.aggregate([
      { $match: { status: COMPLETED_SALES } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.aggregate([
      { $match: { status: COMPLETED_SALES, createdAt: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    User.countDocuments({ role: 'USER' }),
    Product.countDocuments(),
    Category.countDocuments({ isActive: true }),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  return {
    totalOrders,
    dailyOrders,
    monthlyOrders,
    yearlyOrders,
    pendingOrders,
    totalSales: salesAgg[0]?.total || 0,
    monthlySales: monthlySalesAgg[0]?.total || 0,
    totalCustomers,
    totalProducts,
    totalCategories,
    ordersByStatus: byStatus.reduce((acc, row) => ({ ...acc, [row._id]: row.count }), {}),
  };
}

export async function getSalesReport({ months = 6 } = {}) {
  const since = new Date();
  since.setMonth(since.getMonth() - (Number(months) - 1));
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const [monthly, byCategory, topProducts] = await Promise.all([
    Order.aggregate([
      { $match: { createdAt: { $gte: since }, status: COMPLETED_SALES } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          orders: { $sum: 1 },
          sales: { $sum: '$total' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    Order.aggregate([
      { $match: { status: COMPLETED_SALES } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.categorySnapshot',
          sales: { $sum: '$items.totalPrice' },
          quantity: { $sum: '$items.quantity' },
        },
      },
      { $sort: { sales: -1 } },
    ]),
    Order.aggregate([
      { $match: { status: COMPLETED_SALES } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productNameSnapshot',
          quantity: { $sum: '$items.quantity' },
          sales: { $sum: '$items.totalPrice' },
        },
      },
      { $sort: { quantity: -1 } },
      { $limit: 5 },
    ]),
  ]);

  return {
    monthly: monthly.map((row) => ({
      label: `${row._id.year}-${String(row._id.month).padStart(2, '0')}`,
      orders: row.orders,
      sales: row.sales,
    })),
    byCategory: byCategory.map((row) => ({
      category: row._id || 'Uncategorised',
      sales: row.sales,
      quantity: row.quantity,
    })),
    topProducts: topProducts.map((row) => ({
      product: row._id,
      quantity: row.quantity,
      sales: row.sales,
    })),
  };
}

/** Public counters used by the marketing strip on the home page. */
export async function getPublicStats() {
  const [buyers, categories, salesAgg, products] = await Promise.all([
    Order.distinct('userId'),
    Category.countDocuments({ isActive: true }),
    Order.aggregate([
      { $match: { status: COMPLETED_SALES } },
      { $group: { _id: null, cakes: { $sum: { $sum: '$items.quantity' } } } },
    ]),
    Product.countDocuments({ isAvailable: true }),
  ]);

  return {
    happyBuyers: buyers.length,
    categories,
    cakesSold: salesAgg[0]?.cakes || 0,
    products,
  };
}
