import mongoose from 'mongoose';

export const ORDER_STATUSES = [
  'ORDER_RECEIVED',
  'BAKING',
  'OUT_FOR_DELIVERY',
  'COMPLETED',
  'PICKED_UP',
  'CANCELLED',
];

export const ACTIVE_FLOW = [
  'ORDER_RECEIVED',
  'BAKING',
  'OUT_FOR_DELIVERY',
  'COMPLETED',
  'PICKED_UP',
];

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productNameSnapshot: { type: String, required: true },
    imageSnapshot: { type: String, default: '' },
    categorySnapshot: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 1, max: 50 },
    weight: { type: String, default: '' },
    flavour: { type: String, default: '' },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    customization: { type: String, default: '', maxlength: 500 },
  },
  { _id: false },
);

const statusEventSchema = new mongoose.Schema(
  {
    status: { type: String, enum: ORDER_STATUSES, required: true },
    note: { type: String, default: '' },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const screenshotSchema = new mongoose.Schema(
  {
    publicId: String,
    provider: { type: String, default: 'local' },
    visibility: { type: String, default: 'private' },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    customerSnapshot: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      whatsappNumber: { type: String, default: '' },
    },
    deliveryAddress: { type: String, required: true, maxlength: 400 },
    deliveryPreference: { type: String, default: '' },
    subtotal: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, default: 'UPI_QR' },
    paymentScreenshot: { type: screenshotSchema, default: null },
    paymentStatus: {
      type: String,
      enum: ['PENDING_VERIFICATION', 'VERIFIED', 'REJECTED'],
      default: 'PENDING_VERIFICATION',
      index: true,
    },
    status: { type: String, enum: ORDER_STATUSES, default: 'ORDER_RECEIVED', index: true },
    statusHistory: { type: [statusEventSchema], default: [] },
    notes: { type: String, default: '', maxlength: 500 },
  },
  { timestamps: true },
);

orderSchema.index({ createdAt: -1 });

export const Order = mongoose.model('Order', orderSchema);
