import { asyncHandler } from '../utils/asyncHandler.js';
import { created, ok } from '../utils/ApiResponse.js';
import * as slideService from '../services/slide.service.js';

export const listActive = asyncHandler(async (req, res) => {
  const slides = await slideService.listSlides({ includeInactive: false });
  return ok(res, { slides });
});

export const listAll = asyncHandler(async (req, res) => {
  const slides = await slideService.listSlides({ includeInactive: true });
  return ok(res, { slides });
});

export const create = asyncHandler(async (req, res) => {
  const slide = await slideService.createSlide(req.body, req.file);
  return created(res, { slide }, 'Slide added');
});

export const update = asyncHandler(async (req, res) => {
  const slide = await slideService.updateSlide(req.params.id, req.body, req.file);
  return ok(res, { slide }, 'Slide updated');
});

export const reorder = asyncHandler(async (req, res) => {
  const slides = await slideService.reorderSlides(req.body.order);
  return ok(res, { slides }, 'Slide order saved');
});

export const remove = asyncHandler(async (req, res) => {
  const result = await slideService.deleteSlide(req.params.id);
  return ok(res, result, 'Slide deleted');
});
