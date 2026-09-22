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

const priceSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    images: { type: [imageSchema], default: [] },
    flavours: { type: [String], default: [] },
    pricing: {
      type: [priceSchema],
      validate: [(value) => value.length > 0, 'At least one price option is required'],
    },
    defaultPrice: { type: Number, required: true, min: 0 },
    ratingAverage: { type: Number, default: 4, min: 0, max: 5 },
    ratingCount: { type: Number, default: 4, min: 0 },
    salesCount: { type: Number, default: 0, min: 0 },
    isAvailable: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

productSchema.index({ name: 'text', description: 'text' });

productSchema.virtual('sizes').get(function sizes() {
  return this.pricing.map((entry) => entry.label);
});

productSchema.pre('validate', function setDefaultPrice(next) {
  if (this.pricing && this.pricing.length) {
    const lowest = this.pricing.reduce(
      (min, entry) => (entry.price < min ? entry.price : min),
      this.pricing[0].price,
    );
    this.defaultPrice = lowest;
  }
  next();
});

export const Product = mongoose.model('Product', productSchema);
