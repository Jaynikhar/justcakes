import mongoose from 'mongoose';
import { Order, ACTIVE_FLOW } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { buildOrderNumber } from '../utils/orderNumber.js';
import { saveImage } from '../utils/storage.js';

function parseItems(rawItems) {
  const items = typeof rawItems === 'string' ? JSON.parse(rawItems) : rawItems;
  if (!Array.isArray(items) || items.length === 0) throw ApiError.badRequest('Your order is empty');
  return items;
}

/**
 * Builds order line items from the database.
 * Prices sent by the browser are ignored on purpose.
 */
async function buildItems(rawItems) {
  const items = parseItems(rawItems);
  const built = [];

  for (const line of items) {
    if (!mongoose.isValidObjectId(line.productId)) {
      throw ApiError.badRequest('One of the products is not valid');
    }
    // eslint-disable-next-line no-await-in-loop
    const product = await Product.findById(line.productId).populate('categoryId', 'name');
    if (!product) throw ApiError.badRequest('One of the products is no longer available');
    if (!product.isAvailable) {
      throw ApiError.badRequest(`${product.name} is currently unavailable`);
    }

    const quantity = Number(line.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
      throw ApiError.badRequest('Quantity must be a whole number between 1 and 50');
    }

    const variant = line.weight
      ? product.pricing.find((entry) => entry.label === line.weight)
      : product.pricing[0];
    if (!variant) {
      throw ApiError.badRequest(`${line.weight} is not available for ${product.name}`);
    }

    if (line.flavour && product.flavours.length && !product.flavours.includes(line.flavour)) {
      throw ApiError.badRequest(`${line.flavour} is not available for ${product.name}`);
    }

    built.push({
      productId: product._id,
      productNameSnapshot: product.name,
      imageSnapshot: product.images[0]?.url || '',
      categorySnapshot: product.categoryId?.name || '',
      quantity,
      weight: variant.label,
      flavour: line.flavour || product.flavours[0] || '',
      unitPrice: variant.price,
      totalPrice: variant.price * quantity,
      customization: String(line.customization || '').slice(0, 500),
    });
  }

  return built;
}

export async function createOrder(user, payload, screenshotFile) {
  if (!screenshotFile) {
    throw ApiError.badRequest('Upload the payment screenshot to confirm your order');
  }

  const items = await buildItems(payload.items);
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const total = subtotal;

  const screenshot = await saveImage(screenshotFile, 'payments', 'private');

  const order = await Order.create({
    orderNumber: buildOrderNumber(),
    userId: user._id, // identity comes from the token, never the body
    items,
    customerSnapshot: {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      whatsappNumber: payload.whatsappNumber || '',
    },
    deliveryAddress: payload.deliveryAddress,
    deliveryPreference: payload.deliveryPreference || '',
    subtotal,
    total,
    paymentMethod: 'UPI_QR',
    paymentScreenshot: {
      publicId: screenshot.publicId,
      provider: screenshot.provider,
      visibility: 'private',
      uploadedAt: new Date(),
    },
    paymentStatus: 'PENDING_VERIFICATION',
    status: 'ORDER_RECEIVED',
    statusHistory: [{ status: 'ORDER_RECEIVED', note: 'Order placed', changedAt: new Date() }],
    notes: payload.notes || '',
  });

  await Promise.all(
    items.map((item) =>
      Product.findByIdAndUpdate(item.productId, { $inc: { salesCount: item.quantity } }),
    ),
  );

  return order;
}

export async function listUserOrders(userId) {
  return Order.find({ userId }).sort({ createdAt: -1 });
}

export async function getUserOrder(userId, orderId) {
  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('That order does not exist');
  if (String(order.userId) !== String(userId)) throw ApiError.forbidden();
  return order;
}

export async function listAllOrders(query = {}) {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.search) {
    filter.$or = [
      { orderNumber: { $regex: String(query.search).trim(), $options: 'i' } },
      { 'customerSnapshot.name': { $regex: String(query.search).trim(), $options: 'i' } },
      { 'customerSnapshot.phone': { $regex: String(query.search).trim(), $options: 'i' } },
    ];
  }

  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);

  const [items, total] = await Promise.all([
    Order.find(filter)
      .populate('userId', 'name username email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  return { items, total, page, pages: Math.ceil(total / limit) };
}

export async function getOrderForOwner(orderId) {
  const order = await Order.findById(orderId).populate('userId', 'name username email phone');
  if (!order) throw ApiError.notFound('That order does not exist');
  return order;
}

export async function updateOrderStatus(orderId, status, note = '') {
  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('That order does not exist');

  if (order.status === 'PICKED_UP' && status !== 'PICKED_UP') {
    throw ApiError.badRequest('This order is already completed and cannot move back');
  }
  if (order.status === 'CANCELLED' && status !== 'CANCELLED') {
    throw ApiError.badRequest('This order was cancelled and cannot be reopened');
  }
  if (status !== 'CANCELLED' && ACTIVE_FLOW.indexOf(status) === -1) {
    throw ApiError.badRequest('That status is not allowed');
  }

  order.status = status;
  order.statusHistory.push({ status, note, changedAt: new Date() });
  if (status === 'PICKED_UP') order.paymentStatus = 'VERIFIED';
  await order.save();
  return order;
}

export async function setPaymentStatus(orderId, paymentStatus) {
  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('That order does not exist');
  order.paymentStatus = paymentStatus;
  await order.save();
  return order;
}
