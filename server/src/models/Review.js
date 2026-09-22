import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    userNameSnapshot: { type: String, required: true },
    productNameSnapshot: { type: String, default: '' },
    rating: { type: Number, required: true, default: 4, min: 1, max: 5 },
    description: { type: String, required: true, trim: true, minlength: 4, maxlength: 600 },
    isApproved: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

// One review per user per product per order.
reviewSchema.index({ userId: 1, productId: 1, orderId: 1 }, { unique: true });

export const Review = mongoose.model('Review', reviewSchema);
