export const normalizeImageUrl = (value) => {
  if (typeof value !== 'string') return null;

  const url = value.trim();
  if (!url) return null;

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
};

export const parseImageUrlInput = (value) => {
  const rawUrls = value
    .split(/\s+/)
    .map((url) => url.trim())
    .filter(Boolean);

  const urls = [];
  const invalidUrls = [];

  rawUrls.forEach((rawUrl) => {
    const normalizedUrl = normalizeImageUrl(rawUrl);
    if (normalizedUrl) {
      urls.push(normalizedUrl);
    } else {
      invalidUrls.push(rawUrl);
    }
  });

  return { urls, invalidUrls };
};

export const mergeImageUrls = (currentImages, nextImages) => {
  const seen = new Set();
  const mergedImages = [];

  [...currentImages, ...nextImages].forEach((imageUrl) => {
    const normalizedUrl = normalizeImageUrl(imageUrl);
    if (!normalizedUrl || seen.has(normalizedUrl)) return;

    seen.add(normalizedUrl);
    mergedImages.push(normalizedUrl);
  });

  return mergedImages;
};
