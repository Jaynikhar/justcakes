import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { signToken } from '../utils/generateToken.js';

export async function registerUser(payload) {
  const email = payload.email.toLowerCase().trim();
  const username = payload.username.toLowerCase().trim();

  if (await User.exists({ email })) {
    throw ApiError.conflict('An account already uses that email address');
  }
  if (await User.exists({ username })) {
    throw ApiError.conflict('That username is taken');
  }

  const user = new User({
    name: payload.name,
    username,
    email,
    phone: payload.phone,
    whatsappNumber: payload.whatsappNumber || payload.phone,
    address: payload.address,
    role: 'USER', // role is never taken from the request body
  });
  await user.setPassword(payload.password);
  await user.save();

  return { user, token: signToken(user) };
}

export async function loginUser({ identifier, password }) {
  const value = identifier.toLowerCase().trim();
  const user = await User.findOne({
    $or: [{ email: value }, { username: value }],
  }).select('+passwordHash');

  if (!user) throw ApiError.unauthorized('Those sign-in details did not match an account');

  const matches = await user.comparePassword(password);
  if (!matches) throw ApiError.unauthorized('Those sign-in details did not match an account');

  return { user, token: signToken(user) };
}

export async function updateProfile(userId, payload) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('Account not found');

  if (payload.email && payload.email.toLowerCase() !== user.email) {
    const email = payload.email.toLowerCase().trim();
    if (await User.exists({ email, _id: { $ne: user._id } })) {
      throw ApiError.conflict('An account already uses that email address');
    }
    user.email = email;
  }

  ['name', 'phone', 'whatsappNumber', 'address'].forEach((field) => {
    if (payload[field] !== undefined) user[field] = payload[field];
  });

  await user.save();
  return user;
}

export async function changePassword(userId, currentPassword, newPassword) {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) throw ApiError.notFound('Account not found');
  const matches = await user.comparePassword(currentPassword);
  if (!matches) throw ApiError.badRequest('Your current password is not correct');
  await user.setPassword(newPassword);
  await user.save();
  return user;
}
