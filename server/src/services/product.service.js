import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { Review } from '../models/Review.js';
import { ApiError } from '../utils/ApiError.js';
import { uniqueSlug } from '../utils/slugify.js';
import { deleteImage, saveImage } from '../utils/storage.js';

function parseMaybeJson(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }
}

export async function listProducts(query = {}) {
  const filter = {};

  if (query.category) {
    const category = await Category.findOne({
      $or: [
        { slug: String(query.category).toLowerCase() },
        ...(mongoose.isValidObjectId(query.category) ? [{ _id: query.category }] : []),
      ],
    });
    if (!category) return { items: [], total: 0, page: 1, pages: 0 };
    filter.categoryId = category._id;
  }

  if (query.search) filter.name = { $regex: String(query.search).trim(), $options: 'i' };
  if (query.featured === 'true') filter.isFeatured = true;
  if (query.available === 'true') filter.isAvailable = true;

  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 24, 1), 100);

  const sortMap = {
    newest: { createdAt: -1 },
    priceAsc: { defaultPrice: 1 },
    priceDesc: { defaultPrice: -1 },
    rating: { ratingAverage: -1 },
    popular: { salesCount: -1 },
  };
  const sort = sortMap[query.sort] || { createdAt: -1 };

  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate('categoryId', 'name slug')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  return { items, total, page, pages: Math.ceil(total / limit) };
}

export async function getProduct(idOrSlug) {
  const filter = mongoose.isValidObjectId(idOrSlug)
    ? { _id: idOrSlug }
    : { slug: String(idOrSlug).toLowerCase() };

  const product = await Product.findOne(filter).populate('categoryId', 'name slug');
  if (!product) throw ApiError.notFound('That cake is not on the menu');
  return product;
}

export async function createProduct(payload, files = []) {
  const category = await Category.findById(payload.categoryId);
  if (!category) throw ApiError.badRequest('Choose an existing category');

  const pricing = parseMaybeJson(payload.pricing, []).map((entry) => ({
    label: String(entry.label).trim(),
    price: Number(entry.price),
  }));

  const images = [];
  for (const file of files) {
    // eslint-disable-next-line no-await-in-loop
    images.push(await saveImage(file, 'products', 'public'));
  }

  return Product.create({
    name: payload.name,
    slug: await uniqueSlug(Product, payload.name),
    description: payload.description || '',
    categoryId: category._id,
    flavours: parseMaybeJson(payload.flavours, []),
    pricing,
    defaultPrice: pricing.length ? Math.min(...pricing.map((p) => p.price)) : 0,
    images,
    isAvailable: payload.isAvailable === undefined ? true : payload.isAvailable !== 'false',
    isFeatured: payload.isFeatured === 'true' || payload.isFeatured === true,
  });
}

export async function updateProduct(id, payload, files = []) {
  const product = await Product.findById(id);
  if (!product) throw ApiError.notFound('That cake is not on the menu');

  if (payload.categoryId) {
    const category = await Category.findById(payload.categoryId);
    if (!category) throw ApiError.badRequest('Choose an existing category');
    product.categoryId = category._id;
  }
  if (payload.name && payload.name !== product.name) {
    product.name = payload.name;
    product.slug = await uniqueSlug(Product, payload.name, product._id);
  }
  if (payload.description !== undefined) product.description = payload.description;
  if (payload.flavours !== undefined) product.flavours = parseMaybeJson(payload.flavours, []);
  if (payload.pricing !== undefined) {
    const pricing = parseMaybeJson(payload.pricing, []).map((entry) => ({
      label: String(entry.label).trim(),
      price: Number(entry.price),
    }));
    if (!pricing.length) throw ApiError.badRequest('Add at least one size and price');
    product.pricing = pricing;
  }
  if (payload.isAvailable !== undefined) {
    product.isAvailable = payload.isAvailable !== 'false' && payload.isAvailable !== false;
  }
  if (payload.isFeatured !== undefined) {
    product.isFeatured = payload.isFeatured === 'true' || payload.isFeatured === true;
  }

  const keepImages = parseMaybeJson(payload.keepImages, null);
  if (Array.isArray(keepImages)) {
    const removed = product.images.filter((image) => !keepImages.includes(image.publicId));
    product.images = product.images.filter((image) => keepImages.includes(image.publicId));
    await Promise.all(removed.map((image) => deleteImage(image)));
  }

  for (const file of files) {
    // eslint-disable-next-line no-await-in-loop
    product.images.push(await saveImage(file, 'products', 'public'));
  }

  await product.save();
  return product.populate('categoryId', 'name slug');
}

export async function deleteProduct(id) {
  const product = await Product.findById(id);
  if (!product) throw ApiError.notFound('That cake is not on the menu');

  await Promise.all(product.images.map((image) => deleteImage(image)));
  await Review.deleteMany({ productId: product._id });
  await product.deleteOne();
  return { id };
}

export async function recalculateRating(productId) {
  const [summary] = await Review.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(String(productId)), isApproved: true } },
    { $group: { _id: '$productId', average: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  await Product.findByIdAndUpdate(productId, {
    ratingAverage: summary ? Math.round(summary.average * 10) / 10 : 0,
    ratingCount: summary ? summary.count : 0,
  });
}
