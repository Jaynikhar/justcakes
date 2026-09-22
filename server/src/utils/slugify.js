export function slugify(value = '') {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function uniqueSlug(Model, name, ignoreId = null) {
  const base = slugify(name) || 'item';
  let slug = base;
  let counter = 2;
  /* eslint-disable no-await-in-loop */
  while (true) {
    const query = { slug };
    if (ignoreId) query._id = { $ne: ignoreId };
    const exists = await Model.exists(query);
    if (!exists) return slug;
    slug = `${base}-${counter}`;
    counter += 1;
  }
}
