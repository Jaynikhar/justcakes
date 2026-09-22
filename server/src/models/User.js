import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const ROLES = ['USER', 'OWNER'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 80 },
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
      unique: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, 'Enter a valid email address'],
    },
    passwordHash: { type: String, required: true, select: false },
    phone: { type: String, trim: true, maxlength: 20 },
    whatsappNumber: { type: String, trim: true, maxlength: 20 },
    address: { type: String, trim: true, maxlength: 400 },
    role: { type: String, enum: ROLES, default: 'USER', index: true },
  },
  { timestamps: true },
);

userSchema.methods.setPassword = async function setPassword(plain) {
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(plain, salt);
};

userSchema.methods.comparePassword = function comparePassword(plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.methods.toPublic = function toPublic() {
  return {
    id: this._id,
    name: this.name,
    username: this.username,
    email: this.email,
    phone: this.phone || '',
    whatsappNumber: this.whatsappNumber || '',
    address: this.address || '',
    role: this.role,
    createdAt: this.createdAt,
  };
};

export const User = mongoose.model('User', userSchema);
