import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { uniqueSlug } from '../utils/slugify.js';
import { deleteImage, saveImage } from '../utils/storage.js';

export async function listCategories({ includeInactive = false } = {}) {
  const filter = includeInactive ? {} : { isActive: true };
  return Category.find(filter).sort({ displayOrder: 1, name: 1 });
}

export async function getCategoryBySlug(slug) {
  const category = await Category.findOne({ slug });
  if (!category) throw ApiError.notFound('That category does not exist');
  return category;
}

export async function createCategory(payload, file) {
  const slug = await uniqueSlug(Category, payload.name);
  const image = file ? await saveImage(file, 'categories', 'public') : null;

  return Category.create({
    name: payload.name,
    slug,
    description: payload.description || '',
    displayOrder: Number(payload.displayOrder) || 0,
    isActive: payload.isActive === undefined ? true : payload.isActive === 'false' ? false : Boolean(payload.isActive),
    image,
  });
}

export async function updateCategory(id, payload, file) {
  const category = await Category.findById(id);
  if (!category) throw ApiError.notFound('That category does not exist');

  if (payload.name && payload.name !== category.name) {
    category.name = payload.name;
    category.slug = await uniqueSlug(Category, payload.name, category._id);
  }
  if (payload.description !== undefined) category.description = payload.description;
  if (payload.displayOrder !== undefined) category.displayOrder = Number(payload.displayOrder) || 0;
  if (payload.isActive !== undefined) {
    category.isActive = payload.isActive === 'false' ? false : Boolean(payload.isActive);
  }
  if (file) {
    const previous = category.image;
    category.image = await saveImage(file, 'categories', 'public');
    await deleteImage(previous);
  }

  await category.save();
  return category;
}

export async function deleteCategory(id) {
  const category = await Category.findById(id);
  if (!category) throw ApiError.notFound('That category does not exist');

  const productCount = await Product.countDocuments({ categoryId: category._id });
  if (productCount > 0) {
    throw ApiError.conflict(
      `Move or delete the ${productCount} product(s) in this category first`,
    );
  }

  await deleteImage(category.image);
  await category.deleteOne();
  return { id };
}
