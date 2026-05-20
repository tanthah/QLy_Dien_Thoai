const normalizeImageUrl = (value) => {
  if (typeof value !== 'string') return null;

  const url = value.trim();
  if (!url) return null;

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.toString();
  } catch (err) {
    return null;
  }
};

const normalizeImageUrls = (images = []) => {
  if (!Array.isArray(images)) return [];

  const seen = new Set();
  const normalizedImages = [];

  for (const image of images) {
    const normalized = normalizeImageUrl(image);
    if (!normalized || seen.has(normalized)) continue;

    seen.add(normalized);
    normalizedImages.push(normalized);
  }

  return normalizedImages;
};

module.exports = {
  normalizeImageUrl,
  normalizeImageUrls,
};
