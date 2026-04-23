/**
 * Social and profile URLs are HTML pages, not image bytes — React Native cannot render them as images.
 * Only direct image URLs (or file:// from the image picker) work reliably.
 */
const BLOCKED_HOST_PATTERNS =
  /instagram\.com|facebook\.com|fb\.com|tiktok\.com|twitter\.com|x\.com|linkedin\.com/i;

const IMAGE_EXT = /\.(png|jpe?g|webp|gif|svg)(\?|$)/i;

export function isLikelyDirectImageUrl(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("http")) return false;
  try {
    const u = new URL(trimmed);
    if (BLOCKED_HOST_PATTERNS.test(u.hostname)) return false;
    if (IMAGE_EXT.test(u.pathname) || IMAGE_EXT.test(trimmed)) return true;
    // Some CDNs serve images without extensions; allow known image hosts
    if (/i\.imgur\.com|imgur\.com\/a\//i.test(u.hostname)) return true;
    return false;
  } catch {
    return false;
  }
}

export function explainLogoUrlIssue(raw: string): string {
  const t = raw.trim();
  if (!t) return "Enter a direct image link, or pick a photo from your library.";
  if (!t.startsWith("http")) return "Use a link that starts with https:// pointing at an image file.";
  if (BLOCKED_HOST_PATTERNS.test(t)) {
    return "Social profile links are web pages, not images. Open your gym photo in the browser, use “Open image in new tab”, then paste that image URL here — or use Choose Photo.";
  }
  if (!isLikelyDirectImageUrl(t)) {
    return "This URL may not be a raw image. Prefer a .png / .jpg link, or use Choose Photo.";
  }
  return "";
}
