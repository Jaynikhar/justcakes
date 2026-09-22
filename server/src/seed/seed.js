import mongoose from 'mongoose';
import { assertEnv, env } from '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { slugify } from '../utils/slugify.js';
import { categories, products } from './menu.data.js';

async function seedCategories() {
  const map = new Map();
  for (const entry of categories) {
    const slug = slugify(entry.name);
    // eslint-disable-next-line no-await-in-loop
    const category = await Category.findOneAndUpdate(
      { slug },
      {
        $setOnInsert: {
          name: entry.name,
          slug,
          description: entry.description,
          displayOrder: entry.displayOrder,
          isActive: true,
        },
      },
      { new: true, upsert: true },
    );
    map.set(entry.name, category);
    console.log(`  category: ${entry.name}`);
  }
  return map;
}

async function seedProducts(categoryMap) {
  for (const entry of products) {
    const category = categoryMap.get(entry.category);
    if (!category) {
      console.warn(`  skipped ${entry.name} — category ${entry.category} is missing`);
      // eslint-disable-next-line no-continue
      continue;
    }
    const slug = slugify(entry.name);
    // eslint-disable-next-line no-await-in-loop
    const exists = await Product.findOne({ slug });
    if (exists) {
      console.log(`  product exists: ${entry.name}`);
      // eslint-disable-next-line no-continue
      continue;
    }
    // eslint-disable-next-line no-await-in-loop
    await Product.create({
      name: entry.name,
      slug,
      description: entry.description,
      categoryId: category._id,
      flavours: entry.flavours,
      pricing: entry.pricing,
      defaultPrice: Math.min(...entry.pricing.map((p) => p.price)),
      images: [],
      isAvailable: true,
      isFeatured: Boolean(entry.isFeatured),
    });
    console.log(`  product: ${entry.name}`);
  }
}

async function seedOwner() {
  const { email, password, username, name, phone } = env.owner;
  if (!email || !password) {
    console.log('  owner skipped — set OWNER_EMAIL and OWNER_PASSWORD in .env to create one');
    return;
  }
  const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
  if (existing) {
    if (existing.role !== 'OWNER') {
      existing.role = 'OWNER';
      await existing.save();
      console.log('  existing account promoted to OWNER');
    } else {
      console.log('  owner exists');
    }
    return;
  }
  const owner = new User({
    name,
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    phone,
    whatsappNumber: phone,
    address: 'Bakery counter',
    role: 'OWNER',
  });
  await owner.setPassword(password);
  await owner.save();
  console.log(`  owner created: ${owner.email}`);
}

async function run() {
  try {
    assertEnv();
    await connectDB();
    console.log('Seeding Just Cakes…');
    const categoryMap = await seedCategories();
    await seedProducts(categoryMap);
    await seedOwner();
    console.log('Seed complete.');
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState === 1) await disconnectDB();
  }
}

run();
