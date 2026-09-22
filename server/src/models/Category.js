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

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, trim: true, maxlength: 400, default: '' },
    image: { type: imageSchema, default: null },
    displayOrder: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export const Category = mongoose.model('Category', categorySchema);
