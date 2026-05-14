/** Extracts an 11-character YouTube video id from common URL shapes (or bare id). */
export function parseYoutubeVideoId(input: string | null | undefined): string | null {
  if (input == null || typeof input !== 'string') return null;
  const u = input.trim();
  if (!u) return null;
  try {
    const url = /^https?:\/\//i.test(u) ? new URL(u) : new URL(`https://${u}`);
    const host = url.hostname.replace(/^www\./i, '').toLowerCase();
    if (host === 'youtu.be') {
      const id = url.pathname.replace(/^\//, '').split(/[/?#]/)[0];
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }
    if (
      host === 'youtube.com' ||
      host === 'm.youtube.com' ||
      host === 'youtube-nocookie.com' ||
      host === 'music.youtube.com'
    ) {
      const v = url.searchParams.get('v');
      if (v && /^[\w-]{11}$/.test(v)) return v;
      const m = url.pathname.match(/\/(?:embed|shorts|live)\/([\w-]{11})/);
      if (m?.[1]) return m[1];
    }
  } catch {
    if (/^[\w-]{11}$/.test(u)) return u;
  }
  return null;
}

/** Keeps a trimmed URL only when it resolves to a valid YouTube id (max 512 chars). */
export function sanitizeYoutubeVideoUrl(input: string | null | undefined): string | null {
  if (input == null || typeof input !== 'string') return null;
  const t = input.trim();
  if (!t) return null;
  return parseYoutubeVideoId(t) ? t.slice(0, 512) : null;
}
