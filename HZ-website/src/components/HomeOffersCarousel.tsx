'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export type HomeOfferSlide = {
  imageUrl: string
  title: string
  subtitle: string
  ctaLabel?: string
  ctaHref?: string
}

const INTERVAL_MS = 6000

export default function HomeOffersCarousel({ slides }: { slides: HomeOfferSlide[] }) {
  const list = slides.length ? slides : []
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (list.length <= 1) return
    const t = setInterval(() => setIdx((i) => (i + 1) % list.length), INTERVAL_MS)
    return () => clearInterval(t)
  }, [list.length])

  const go = useCallback(
    (dir: -1 | 1) => {
      setIdx((i) => (i + dir + list.length) % list.length)
    },
    [list.length],
  )

  if (!list.length) return null

  const current = list[idx] ?? list[0]

  return (
    <section
      className="relative isolate w-full overflow-hidden border border-[#dde8f5] bg-[#0f2a44]"
      style={{
        borderRadius: 16,
        minHeight: 'clamp(200px, 32vw, 260px)',
      }}
      aria-roledescription="carousel"
      aria-label="Houznext interiors offers"
    >
      {list.map((s, i) => (
        <div
          key={`offer-slide-${i}`}
          className="absolute inset-0 transition-opacity duration-500 ease-out"
          style={{
            opacity: i === idx ? 1 : 0,
            pointerEvents: i === idx ? 'auto' : 'none',
            zIndex: i === idx ? 2 : 1,
          }}
          aria-hidden={i !== idx}
        >
          <Image
            src={s.imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
            loading={i === 0 ? 'eager' : 'lazy'}
          />
          {/* Text legibility: strong gradient under copy (store-style proportions) */}
          <div
            className="absolute inset-0 z-[1]"
            style={{
              background:
                'linear-gradient(105deg, rgba(15,42,68,0.92) 0%, rgba(15,42,68,0.72) 38%, rgba(15,42,68,0.35) 62%, rgba(15,42,68,0.12) 100%)',
            }}
          />
        </div>
      ))}

      <div
        className="relative z-[10] flex min-h-[clamp(200px,32vw,260px)] flex-col justify-end p-[clamp(16px,4vw,26px)] text-white"
        style={{ paddingLeft: 'clamp(14px, 5vw, 30px)', paddingRight: 'clamp(48px, 8vw, 88px)' }}
      >
        <div className="absolute right-[clamp(10px,3vw,18px)] top-[clamp(10px,3vw,18px)] z-[3] flex gap-2">
          <button
            type="button"
            onClick={() => go(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/30 bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Previous offer"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/30 bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Next offer"
          >
            ›
          </button>
        </div>

        <h2 className="font-head text-[clamp(1.35rem,4.2vw,1.85rem)] font-extrabold leading-tight tracking-tight drop-shadow-sm">
          {current.title}
        </h2>
        <p className="mt-2 max-w-xl text-[clamp(0.8rem,2.6vw,0.9rem)] leading-relaxed text-white/90">
          {current.subtitle}
        </p>
        {current.ctaLabel && current.ctaHref ? (
          <div className="mt-3">
            {/^https?:\/\//i.test(current.ctaHref) ? (
              <a
                href={current.ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-lg bg-[#2f80ed] px-4 py-2 text-[13px] font-bold text-white no-underline transition-transform hover:-translate-y-0.5 hover:bg-[#1a6dd6]"
              >
                {current.ctaLabel}
              </a>
            ) : (
              <Link
                href={current.ctaHref}
                className="inline-flex items-center rounded-lg bg-[#2f80ed] px-4 py-2 text-[13px] font-bold text-white no-underline transition-transform hover:-translate-y-0.5 hover:bg-[#1a6dd6]"
              >
                {current.ctaLabel}
              </Link>
            )}
          </div>
        ) : null}

        <div className="mt-4 flex gap-1.5" role="tablist" aria-label="Offer slides">
          {list.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === idx}
              onClick={() => setIdx(i)}
              className="h-2.5 w-2.5 rounded-full border-0 p-0 transition-transform"
              style={{
                background: i === idx ? '#f2994a' : 'rgba(255,255,255,0.45)',
                transform: i === idx ? 'scale(1.15)' : 'scale(1)',
              }}
              aria-label={`Go to offer ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
