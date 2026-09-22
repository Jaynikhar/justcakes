import { asyncHandler } from '../utils/asyncHandler.js';
import { created, ok } from '../utils/ApiResponse.js';
import * as categoryService from '../services/category.service.js';

export const list = asyncHandler(async (req, res) => {
  const includeInactive = req.user?.role === 'OWNER' && req.query.all === 'true';
  const categories = await categoryService.listCategories({ includeInactive });
  return ok(res, { categories });
});

export const create = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body, req.file);
  return created(res, { category }, 'Category added');
});

export const update = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body, req.file);
  return ok(res, { category }, 'Category updated');
});

export const remove = asyncHandler(async (req, res) => {
  const result = await categoryService.deleteCategory(req.params.id);
  return ok(res, result, 'Category deleted');
});
