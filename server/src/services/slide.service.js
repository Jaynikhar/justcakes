import { Slide } from '../models/Slide.js';
import { ApiError } from '../utils/ApiError.js';
import { deleteImage, saveImage } from '../utils/storage.js';

export async function listSlides({ includeInactive = false } = {}) {
  const filter = includeInactive ? {} : { isActive: true };
  return Slide.find(filter).sort({ displayOrder: 1, createdAt: 1 });
}

export async function createSlide(payload, file) {
  if (!file) throw ApiError.badRequest('Choose a slide image');
  const image = await saveImage(file, 'slides', 'public');
  const count = await Slide.countDocuments();

  return Slide.create({
    image,
    title: payload.title || '',
    subtitle: payload.subtitle || '',
    ctaText: payload.ctaText || '',
    ctaLink: payload.ctaLink || '',
    displayOrder: payload.displayOrder !== undefined ? Number(payload.displayOrder) : count,
    isActive: payload.isActive === undefined ? true : payload.isActive !== 'false',
  });
}

export async function updateSlide(id, payload, file) {
  const slide = await Slide.findById(id);
  if (!slide) throw ApiError.notFound('That slide does not exist');

  ['title', 'subtitle', 'ctaText', 'ctaLink'].forEach((field) => {
    if (payload[field] !== undefined) slide[field] = payload[field];
  });
  if (payload.displayOrder !== undefined) slide.displayOrder = Number(payload.displayOrder) || 0;
  if (payload.isActive !== undefined) {
    slide.isActive = payload.isActive !== 'false' && payload.isActive !== false;
  }
  if (file) {
    const previous = slide.image;
    slide.image = await saveImage(file, 'slides', 'public');
    await deleteImage(previous);
  }

  await slide.save();
  return slide;
}

export async function reorderSlides(order) {
  await Promise.all(
    order.map((entry, index) =>
      Slide.findByIdAndUpdate(entry.id || entry, {
        displayOrder: entry.displayOrder !== undefined ? entry.displayOrder : index,
      }),
    ),
  );
  return listSlides({ includeInactive: true });
}

export async function deleteSlide(id) {
  const slide = await Slide.findById(id);
  if (!slide) throw ApiError.notFound('That slide does not exist');
  await deleteImage(slide.image);
  await slide.deleteOne();
  return { id };
}
