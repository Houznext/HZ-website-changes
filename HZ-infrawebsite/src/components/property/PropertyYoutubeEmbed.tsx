'use client';

import { parseYoutubeVideoId, youtubeNoCookieEmbedSrc } from '@/lib/youtube';

type Props = {
  youtubeVideoUrl: string | null | undefined;
};

export function PropertyYoutubeEmbed({ youtubeVideoUrl }: Props) {
  const id = parseYoutubeVideoId(youtubeVideoUrl ?? '');
  if (!id) return null;
  const src = youtubeNoCookieEmbedSrc(id);

  return (
    <section className="mt-4" aria-label="Property video tour">
      <h2 className="mb-2 font-montserrat text-xs font-bold uppercase tracking-wide text-muted">Video tour</h2>
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-[#dde8f5] bg-black/5">
        <iframe
          title="Property video tour"
          src={src}
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </section>
  );
}
