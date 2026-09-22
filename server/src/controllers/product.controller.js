import { asyncHandler } from '../utils/asyncHandler.js';
import { created, ok } from '../utils/ApiResponse.js';
import * as productService from '../services/product.service.js';

export const list = asyncHandler(async (req, res) => {
  const result = await productService.listProducts(req.query);
  return ok(res, { products: result.items }, 'OK', {
    total: result.total,
    page: result.page,
    pages: result.pages,
  });
});

export const detail = asyncHandler(async (req, res) => {
  const product = await productService.getProduct(req.params.idOrSlug);
  return ok(res, { product });
});

export const create = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body, req.files || []);
  return created(res, { product }, 'Product added');
});

export const update = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body, req.files || []);
  return ok(res, { product }, 'Product updated');
});

export const remove = asyncHandler(async (req, res) => {
  const result = await productService.deleteProduct(req.params.id);
  return ok(res, result, 'Product deleted');
});
