/** Returns the 11-character id if `url` is a watchable YouTube video URL, else null. */
export function extractYoutubeVideoId(url: string): string | null {
  const s = url.trim();
  if (!s) return null;
  try {
    const u = new URL(s);
    if (u.hostname === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v && /^[\w-]{11}$/.test(v)) return v;
      const embed = u.pathname.match(/^\/embed\/([\w-]{11})/);
      if (embed) return embed[1];
      const shorts = u.pathname.match(/^\/shorts\/([\w-]{11})/);
      if (shorts) return shorts[1];
    }
  } catch {
    return null;
  }
  return null;
}

export function hasValidYoutubeWatchUrl(url: string): boolean {
  return extractYoutubeVideoId(url) !== null;
}

export function canonicalYoutubeWatchUrl(url: string): string | null {
  const id = extractYoutubeVideoId(url);
  return id ? `https://www.youtube.com/watch?v=${id}` : null;
}
