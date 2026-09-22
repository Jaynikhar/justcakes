import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  {
    url: String,
    publicId: String,
    provider: { type: String, default: 'local' },
    visibility: { type: String, default: 'public' },
  },
  { _id: false },
);

const slideSchema = new mongoose.Schema(
  {
    image: { type: imageSchema, required: true },
    title: { type: String, trim: true, maxlength: 120, default: '' },
    subtitle: { type: String, trim: true, maxlength: 200, default: '' },
    ctaText: { type: String, trim: true, maxlength: 40, default: '' },
    ctaLink: { type: String, trim: true, maxlength: 200, default: '' },
    displayOrder: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export const Slide = mongoose.model('Slide', slideSchema);
